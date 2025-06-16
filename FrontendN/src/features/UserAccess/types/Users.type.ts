
export interface UserAccess {
  user_uuid: string;
  domain_uuid: string;
  contact_uuid: string | null;
  username: string;
  password?: string;
  salt: string | null;
  user_email: string | null;
  user_description?: string | null;
  user_status: string;
  api_key: string | null;
  user_totp_secret: string | null;
  user_enabled: string;
  add_user: string | null;
  add_date: string | null;
  insert_date: string | null;
  insert_user: string | null;
  update_date: string | null;
  update_user: string | null;
}