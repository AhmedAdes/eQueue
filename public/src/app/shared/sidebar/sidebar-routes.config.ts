import { RouteInfo } from './sidebar.metadata';
import { AuthenticationService } from '../../services'

const curUser = new AuthenticationService().currentUser

export const ROUTES: RouteInfo[] = [

    {
        path: '/home/dashboard', title: 'Dashboard', icon: 'ft-layout', class: '',
        badge: '', badgeClass: '', isExternalLink: false, submenu: []
    },
    {
        path: '/home/users', title: 'Users', icon: 'ft-square', class: '',
        badge: '', badgeClass: '', isExternalLink: false, submenu: []
    },
    {
        path: '', title: 'Company Structure', icon: 'ft-codepen', class: 'has-sub', badge: '', badgeClass: '', isExternalLink: false,
        submenu: [
            { path: '/home/company', title: 'Company', icon: 'ft-box', class: '',
            badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
            { path: '', title: 'Departments', icon: 'ft-layers', class: '',
            badge: '', badgeClass: '', isExternalLink: true, submenu: [] },
            { path: '', title: 'Branches', icon: 'ft-life-buoy', class: '',
            badge: '', badgeClass: '', isExternalLink: true, submenu: [] },
            { path: '', title: 'Users', icon: 'ft-user', class: '',
            badge: '', badgeClass: '', isExternalLink: true, submenu: [] }
        ]
    },
    {
        path: '/home/customer/issue', title: 'Issue new Ticket', icon: 'ft-square', class: '',
        badge: '', badgeClass: '', isExternalLink: false, submenu: [], disable: curUser && curUser.etyp === 1
    },
    {
        path: '/home/customer/actv', title: 'Active Tickets', icon: 'ft-square', class: '',
        badge: '', badgeClass: '', isExternalLink: false, submenu: [], disable: curUser && curUser.etyp === 1
    },
    {
        path: '/home/customer/hstry', title: 'Tickets History', icon: 'ft-square', class: '',
        badge: '', badgeClass: '', isExternalLink: false, submenu: [], disable: curUser && curUser.etyp === 1
    },
    {
        path: '/out/login', title: 'Login', icon: 'ft-square', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: []
    },
    {
        path: '/changelog', title: 'ChangeLog', icon: 'ft-file', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: []
    },
    { path: 'https://pixinvent.com/apex-angular-4-bootstrap-admin-template/documentation',
      title: 'Documentation', icon: 'ft-folder', class: '', badge: '', badgeClass: '', isExternalLink: true, submenu: []
    },
    { path: 'https://pixinvent.ticksy.com/', title: 'Support', icon: 'ft-life-buoy',
      class: '', badge: '', badgeClass: '', isExternalLink: true, submenu: []
    },

];
