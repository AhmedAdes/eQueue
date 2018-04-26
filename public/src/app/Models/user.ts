export class User {
    UserID: number;
    UserName: string;
    UserPass: string = 'cmacgm';
    UserRole: string;
    EntityType: number;
    ManagerID: number = null;
    ManagerName: string;
    CreateDate: Date;
    Phone: string;
    Mobile: string;
    Email: string;
    AcFailCount: number;
    Title: string;
    CompID: number;
    BranchID: number;
    CompName: string;
    BranchName: string;
    photo: string;
    Disabled: boolean;
    Salt: string;
    Departments: any[] = [];
}

export class CurrentUser {
    uID: number;
    uName: string;
    uRl: number;
    etyp: number;
    tkn: string;
    slt: string;
    photo: string;
    cID: number;
    bID: number;
    uWD: number;
    uDL: string;
    uAL: string;
    cSet: string;
}
