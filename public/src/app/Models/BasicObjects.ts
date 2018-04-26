// export const NodeUrl = '/api/'
export const NodeUrl = 'http://localhost:2525/api/'

export const UserRoles = [
    { class: 0, name: 'SysAdmin' },
    { class: 1, name: 'CompAdmin' },
    // { class: 2, name: 'Sales Manager' },
    { class: 2, name: 'Super User' },
    { class: 3, name: 'User' },
    { class: 4, name: 'MainDisplay' },
    { class: 99, name: 'Anonymous' }
]

export const CompanySetup = [
    { class: 0, name: 'Comp' },
    { class: 1, name: 'Brnch' },
    { class: 2, name: 'Usrs' },
    { class: 3, name: 'Dept' },
    { class: 4, name: 'Completed' }
]
export const CompanyTypes = [
    { class: 0, name: 'Client' },
    { class: 1, name: 'Provider' }
]

export const WorkFields = [
    'Freight Forwarding',
    'Customs',
    'Industrial',
    'Shipping'
]

export const Languages = [
    { name: 'Arabic', abbv: 'ar-EG', domain: 'ar' },
    { name: 'English', abbv: 'en-UK', domain: 'en' },
    { name: 'French', abbv: 'fr-FR', domain: 'fr' }
]

