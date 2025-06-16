export interface FormData {
    username: string;
    email: string;
    password: string;
    user_enabled: boolean;
    roles_id: string;
}
  

export interface Account {
  users_id: string;
  username: string;
  email: string | null;
  roles: string;
  user_enabled: string;
  roles_id: string;
}

export interface Role {
  roles_id: string;
  name: string;
  description: string | null;
}
