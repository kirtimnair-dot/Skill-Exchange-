import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

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

interface CreateProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProjectVariables): MutationRef<CreateProjectData, CreateProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateProjectVariables): MutationRef<CreateProjectData, CreateProjectVariables>;
  operationName: string;
}
export const createProjectRef: CreateProjectRef;

export function createProject(vars: CreateProjectVariables): MutationPromise<CreateProjectData, CreateProjectVariables>;
export function createProject(dc: DataConnect, vars: CreateProjectVariables): MutationPromise<CreateProjectData, CreateProjectVariables>;

interface ListProjectsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProjectsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListProjectsData, undefined>;
  operationName: string;
}
export const listProjectsRef: ListProjectsRef;

export function listProjects(): QueryPromise<ListProjectsData, undefined>;
export function listProjects(dc: DataConnect): QueryPromise<ListProjectsData, undefined>;

interface UpdateSiteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSiteVariables): MutationRef<UpdateSiteData, UpdateSiteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateSiteVariables): MutationRef<UpdateSiteData, UpdateSiteVariables>;
  operationName: string;
}
export const updateSiteRef: UpdateSiteRef;

export function updateSite(vars: UpdateSiteVariables): MutationPromise<UpdateSiteData, UpdateSiteVariables>;
export function updateSite(dc: DataConnect, vars: UpdateSiteVariables): MutationPromise<UpdateSiteData, UpdateSiteVariables>;

interface GetSiteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSiteVariables): QueryRef<GetSiteData, GetSiteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSiteVariables): QueryRef<GetSiteData, GetSiteVariables>;
  operationName: string;
}
export const getSiteRef: GetSiteRef;

export function getSite(vars: GetSiteVariables): QueryPromise<GetSiteData, GetSiteVariables>;
export function getSite(dc: DataConnect, vars: GetSiteVariables): QueryPromise<GetSiteData, GetSiteVariables>;

