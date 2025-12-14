import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface CreateProjectData {
  project_insert: Project_Key;
}

export interface CreateProjectVariables {
  name: string;
  projectId: string;
}

export interface File_Key {
  id: UUIDString;
  __typename?: 'File_Key';
}

export interface GetSiteData {
  site?: {
    id: UUIDString;
    name: string;
    siteId: string;
    customDomain?: string | null;
  } & Site_Key;
}

export interface GetSiteVariables {
  id: UUIDString;
}

export interface ListProjectsData {
  projects: ({
    id: UUIDString;
    name: string;
    projectId: string;
    description?: string | null;
  } & Project_Key)[];
}

export interface Project_Key {
  id: UUIDString;
  __typename?: 'Project_Key';
}

export interface Site_Key {
  id: UUIDString;
  __typename?: 'Site_Key';
}

export interface UpdateSiteData {
  site_update?: Site_Key | null;
}

export interface UpdateSiteVariables {
  id: UUIDString;
  customDomain?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface Version_Key {
  id: UUIDString;
  __typename?: 'Version_Key';
}

/** Generated Node Admin SDK operation action function for the 'CreateProject' Mutation. Allow users to execute without passing in DataConnect. */
export function createProject(dc: DataConnect, vars: CreateProjectVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateProjectData>>;
/** Generated Node Admin SDK operation action function for the 'CreateProject' Mutation. Allow users to pass in custom DataConnect instances. */
export function createProject(vars: CreateProjectVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateProjectData>>;

/** Generated Node Admin SDK operation action function for the 'ListProjects' Query. Allow users to execute without passing in DataConnect. */
export function listProjects(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListProjectsData>>;
/** Generated Node Admin SDK operation action function for the 'ListProjects' Query. Allow users to pass in custom DataConnect instances. */
export function listProjects(options?: OperationOptions): Promise<ExecuteOperationResponse<ListProjectsData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateSite' Mutation. Allow users to execute without passing in DataConnect. */
export function updateSite(dc: DataConnect, vars: UpdateSiteVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateSiteData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateSite' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateSite(vars: UpdateSiteVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateSiteData>>;

/** Generated Node Admin SDK operation action function for the 'GetSite' Query. Allow users to execute without passing in DataConnect. */
export function getSite(dc: DataConnect, vars: GetSiteVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetSiteData>>;
/** Generated Node Admin SDK operation action function for the 'GetSite' Query. Allow users to pass in custom DataConnect instances. */
export function getSite(vars: GetSiteVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetSiteData>>;

