import { CreateProjectData, CreateProjectVariables, ListProjectsData, UpdateSiteData, UpdateSiteVariables, GetSiteData, GetSiteVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateProject(options?: useDataConnectMutationOptions<CreateProjectData, FirebaseError, CreateProjectVariables>): UseDataConnectMutationResult<CreateProjectData, CreateProjectVariables>;
export function useCreateProject(dc: DataConnect, options?: useDataConnectMutationOptions<CreateProjectData, FirebaseError, CreateProjectVariables>): UseDataConnectMutationResult<CreateProjectData, CreateProjectVariables>;

export function useListProjects(options?: useDataConnectQueryOptions<ListProjectsData>): UseDataConnectQueryResult<ListProjectsData, undefined>;
export function useListProjects(dc: DataConnect, options?: useDataConnectQueryOptions<ListProjectsData>): UseDataConnectQueryResult<ListProjectsData, undefined>;

export function useUpdateSite(options?: useDataConnectMutationOptions<UpdateSiteData, FirebaseError, UpdateSiteVariables>): UseDataConnectMutationResult<UpdateSiteData, UpdateSiteVariables>;
export function useUpdateSite(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateSiteData, FirebaseError, UpdateSiteVariables>): UseDataConnectMutationResult<UpdateSiteData, UpdateSiteVariables>;

export function useGetSite(vars: GetSiteVariables, options?: useDataConnectQueryOptions<GetSiteData>): UseDataConnectQueryResult<GetSiteData, GetSiteVariables>;
export function useGetSite(dc: DataConnect, vars: GetSiteVariables, options?: useDataConnectQueryOptions<GetSiteData>): UseDataConnectQueryResult<GetSiteData, GetSiteVariables>;
