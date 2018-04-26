import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CompanyService, UserService, AuthGuard, AuthenticationService } from 'app/services';
import { Countries } from 'app/Models/countries';
import { WorkFields, User, Company } from 'app/Models';
import { Input } from '@angular/core';


@Component({
    selector: 'company',
    templateUrl: './company.component.html',
    styleUrls: ['./company.component.scss']
})

export class CompanyComponent implements OnInit {
    @Input() companyId: number = 0;

    company = new Company();
    countries = Countries;
    cities: any[] = [];
    workfields = WorkFields;
    form: FormGroup;
    spinner: boolean = true;

    constructor(private router: Router, private route: ActivatedRoute,
        private srvComp: CompanyService, private srvUsr: UserService,
        private srvAuth: AuthenticationService, private fb: FormBuilder) {

        this.createForm();
    }

    ngOnInit() {
        this.srvComp.getCompanyId(this.srvAuth.getUser().uID)
            .subscribe(res => {
                this.companyId = res.CompID;
                console.log(this.companyId)
                if (this.companyId == null)
                    this.spinner = false;
                this.getData();
            });
    }

    createForm() {
        this.form = this.fb.group({
            CompName: ['',
                [
                    Validators.required,
                    Validators.minLength(5)
                ]
            ],
            Country: ['', Validators.required],
            City: ['', Validators.required],
            //logo: [],
            CompAddress: [''],
            Phone: [''],
            Mobile: [''],
            Website: [''],
            Email: [''],
            Fax: [''],
            Description: [''],
            WorkField: ['', Validators.required],
            MaxPend:['']
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
    loadForm() {
        this.form.patchValue(this.company);
        this.spinner = false;
    }
    getData() {
        if (this.companyId > 0 && this.companyId != null && this.companyId != undefined) {
            this.srvComp.getComp(this.companyId)
                .subscribe((data) => {
                    console.log(data);
                    this.company = data;
                    this.loadForm();
                    this.spinner = false;
                });
        }
    }
    OnSubmit() {
        this.assignValue();
        if (this.companyId == 0 || this.companyId == null) {
            let currUser = this.srvAuth.getUser();

            this.srvComp.InsertComp(this.company, currUser.uID)
                .subscribe(
                res => {
                    this.router.navigateByUrl('/out/companySetup/departments', { relativeTo: this.route.parent, skipLocationChange: true });
                });
        }
        else {
            this.srvComp.UpdateComp(this.company)
                .subscribe(() => {
                    this.router.navigateByUrl('/out/companySetup/departments', { relativeTo: this.route.parent, skipLocationChange: true });
                },
                (err) => {
                    console.log(err);
                });
        }
    }
    assignValue() {
        this.company.CompName = this.CompName.value;
        this.company.Country = this.Country.value;
        this.company.City = this.City.value;
        this.company.CompType = 'Provider';
        this.company.CompAddress = this.CompAddress.value;
        this.company.Phone = this.Phone.value;
        this.company.Mobile = this.Mobile.value;
        this.company.Website = this.Website.value;
        this.company.Email = this.Email.value;
        this.company.Fax = this.Fax.value;
        this.company.Description = this.Description.value;
        this.company.WorkField = this.WorkField.value;        
        this.company.Disabled = false;
        this.company.MaxPend = this.MaxPend.value as number;        
    }
    get CompName() { return this.form.get('CompName'); }
    get Country() { return this.form.get('Country'); }
    get City() { return this.form.get('City'); }
    get CompAddress() { return this.form.get('CompAddress'); }
    get Phone() { return this.form.get('Phone'); }
    get Mobile() { return this.form.get('Mobile'); }
    get Website() { return this.form.get('Website'); }
    get Email() { return this.form.get('Email'); }
    get Fax() { return this.form.get('Fax'); }
    get Description() { return this.form.get('Description'); }
    get WorkField() { return this.form.get('WorkField'); }
    get MaxPend() { return this.form.get('MaxPend'); }
}
