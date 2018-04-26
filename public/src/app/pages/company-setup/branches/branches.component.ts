import { Component, OnInit, Input } from '@angular/core';
import { Form, Validators, FormBuilder, FormArray } from '@angular/forms';

import { Countries } from 'app/Models/countries';
import { FormDataService } from '../data/formData.service';
import { WorkflowService } from "../workflow/workflow.service";
import { STEPS } from "../workflow/workflow.model";
import { Router, ActivatedRoute } from "@angular/router";
import { Department, Branch, Languages } from 'app/Models';
import { CompanyService, AuthenticationService, DepartmentService, BranchService } from 'app/services';

@Component({
    selector: 'mt-wizard-branches',
    templateUrl: './branches.component.html',
    styleUrls: ['./branches.component.scss']
})

export class BranchesComponent implements OnInit {
    form: any;
    @Input() companyId = 0;
    countries = Countries;
    cities: any[] = [];
    currentDepartments: any[] = [];
    departments: Department[] = [];// for the select control
    branches: Branch[] = [];
    branch = new Branch();
    languages = Languages;
    constructor(private router: Router,
        private route: ActivatedRoute, private formDataService: FormDataService,
        private workflowService: WorkflowService, private fb: FormBuilder,
        private srvComp: CompanyService, private srvAuth: AuthenticationService,
        private srvDept: DepartmentService, private srvBrnch: BranchService) {
        this.createForm();
    }
    ngOnInit() {
        if (this.companyId == 0) {
            this.srvComp.getCompanyId(this.srvAuth.getUser().uID)
                .subscribe(res => {
                    this.companyId = res.CompID;
                    this.form.patchValue({ CompID: this.companyId });

                    this.getAllDepts();
                    this.getAllBranches();
                });

        }
    }
    getAllBranches() {
        if (this.companyId > 0 && this.companyId != null && this.companyId != undefined) {
            this.srvBrnch.getCompBrnchs(this.companyId)
                .subscribe((data) => {
                    this.branches = data;
                });
        }
    }
    getAllDepts() {
        if (this.companyId > 0 && this.companyId != null && this.companyId != undefined) {
            this.srvDept.getCompDepts(this.companyId)
                .subscribe((data) => {
                    this.departments = data;
                });
        }
    }
    createForm() {
        this.form = this.fb.group({
            BranchName: ['',
                [
                    Validators.required,
                    Validators.minLength(3)
                ]
            ],
            CompID: ['', Validators.required],
            Country: ['', Validators.required],
            City: ['', Validators.required],
            BranchAddress: ['', Validators.required],
            Phone: ['', Validators.required],
            Mobile: ['', Validators.required],
            Email: ['',
                [
                    Validators.required
                    , Validators.email]
            ],
            Fax: ['', Validators.required],
            Departments: this.fb.array([], Validators.required),
            Disabled: [''],
            DefaultLang: ['', Validators.required],
            AudioLang: ['', Validators.required]
        });
        this.Country.valueChanges.subscribe(val => {
            this.onCountryChange(val);
        })
    }
    onCountryChange(val) {
        if (!val) return
        this.srvComp.getCountryCities(val)
            .subscribe(res => {
                this.cities = res;
            })
    }
    SetDepartments(departments: any[]) {
        const departmentFGs = departments.map(department => this.fb.group(department));
        const departmentFormArray = this.fb.array(departmentFGs);
        this.form.setControl('Departments', departmentFormArray);
    }
    addDepartment(department) {
        if (!this.branch.Departments.includes(department)) {
            this.branch.Departments.push(department);
            this.SetDepartments(this.branch.Departments);
        }
    }
    removeDepartment(department) {
        let index = this.branch.Departments.indexOf(department);
        this.branch.Departments.splice(index, 1);
        this.SetDepartments(this.branch.Departments);
    }
    assignBranchValue() {
        this.branch.BranchName = this.BranchName.value;
        this.branch.CompID = this.CompID.value;
        this.branch.Country = this.countries.find(c => c.code == this.Country.value).name;
        this.branch.City = this.City.value;
        this.branch.BranchAddress = this.BranchAddress.value;
        this.branch.Phone = this.Phone.value;
        this.branch.Mobile = this.Mobile.value;
        this.branch.Email = this.Email.value;
        this.branch.Fax = this.Fax.value;
        this.branch.Departments = this.branch.Departments;
        this.branch.Disabled = this.Disabled.value;
        this.branch.DefaultLang = this.DefaultLang.value;
        this.branch.AudioLang = this.AudioLang.value;
    }
    OnBranchSelect(branch: Branch) {
        this.Reset();
        this.branch = branch;
        if (this.branch.Country.length > 2)
            this.branch.Country = this.countries.find(c => c.name == branch.Country).code;
        this.SetDepartments(this.branch.Departments);
        this.form.patchValue(this.branch);
    }
    OnSubmit() {
        this.assignBranchValue();
        if (this.branch.BranchID > 0) {
            this.srvBrnch.updateBranch(this.branch)
                .subscribe(res => {
                    this.Reset();
                });
        } else {
            this.srvBrnch.createBranch(this.branch)
                .subscribe(res => {
                    this.branch.BranchID = res;
                    this.branches.push(this.branch);
                    this.Reset();
                });
        }
    }
    Reset() {

        this.branch = new Branch();
        this.branch.CompID = this.companyId;

        this.form.reset();
        this.form.patchValue({
            CompID: this.companyId
        });
        this.SetDepartments([]);
    }
    next() {
        this.router.navigateByUrl('/out/companySetup/users', { relativeTo: this.route.parent, skipLocationChange: true });
    }
    previous() {
        this.router.navigateByUrl('/out/companySetup/departments', { relativeTo: this.route.parent, skipLocationChange: true });
    }
    get BranchName() { return this.form.get('BranchName'); }
    get CompID() { return this.form.get('CompID'); }
    get Country() { return this.form.get('Country'); }
    get City() { return this.form.get('City'); }
    get BranchAddress() { return this.form.get('BranchAddress'); }
    get Phone() { return this.form.get('Phone'); }
    get Mobile() { return this.form.get('Mobile'); }
    get Email() { return this.form.get('Email'); }
    get Fax() { return this.form.get('Fax'); }
    get Departments() { return this.form.get('Departments') as FormArray; }
    get Disabled() { return this.form.get('Disabled'); }
    get DefaultLang() { return this.form.get('DefaultLang') }
    get AudioLang() { return this.form.get('AudioLang') }
}