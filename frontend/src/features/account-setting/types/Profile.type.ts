export interface Profile {
    username: string;
    email: string;
    full_name: string;
}

export interface profileData {
    username: string;
    email: string;
    full_name: string;
    password?: string;
    confirm_password?: string; 
}


export interface updateProfileData {
    username: string;
    email: string;
    full_name: string;
    password?: string; 
}

export interface ResponseUpdateProfileData {
    username: string;
    full_name: string;
    email: string;
}