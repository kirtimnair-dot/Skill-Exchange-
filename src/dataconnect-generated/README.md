# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListProjects*](#listprojects)
  - [*GetSite*](#getsite)
- [**Mutations**](#mutations)
  - [*CreateProject*](#createproject)
  - [*UpdateSite*](#updatesite)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListProjects
You can execute the `ListProjects` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listProjects(): QueryPromise<ListProjectsData, undefined>;

interface ListProjectsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProjectsData, undefined>;
}
export const listProjectsRef: ListProjectsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listProjects(dc: DataConnect): QueryPromise<ListProjectsData, undefined>;

interface ListProjectsRef {
  ...
  (dc: DataConnect): QueryRef<ListProjectsData, undefined>;
}
export const listProjectsRef: ListProjectsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listProjectsRef:
```typescript
const name = listProjectsRef.operationName;
console.log(name);
```

### Variables
The `ListProjects` query has no variables.
### Return Type
Recall that executing the `ListProjects` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListProjectsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListProjectsData {
  projects: ({
    id: UUIDString;
    name: string;
    projectId: string;
    description?: string | null;
  } & Project_Key)[];
}
```
### Using `ListProjects`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listProjects } from '@dataconnect/generated';


// Call the `listProjects()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listProjects();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listProjects(dataConnect);

console.log(data.projects);

// Or, you can use the `Promise` API.
listProjects().then((response) => {
  const data = response.data;
  console.log(data.projects);
});
```

### Using `ListProjects`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listProjectsRef } from '@dataconnect/generated';


// Call the `listProjectsRef()` function to get a reference to the query.
const ref = listProjectsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listProjectsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.projects);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.projects);
});
```

## GetSite
You can execute the `GetSite` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getSite(vars: GetSiteVariables): QueryPromise<GetSiteData, GetSiteVariables>;

interface GetSiteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSiteVariables): QueryRef<GetSiteData, GetSiteVariables>;
}
export const getSiteRef: GetSiteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSite(dc: DataConnect, vars: GetSiteVariables): QueryPromise<GetSiteData, GetSiteVariables>;

interface GetSiteRef {
  ...
  (dc: DataConnect, vars: GetSiteVariables): QueryRef<GetSiteData, GetSiteVariables>;
}
export const getSiteRef: GetSiteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSiteRef:
```typescript
const name = getSiteRef.operationName;
console.log(name);
```

### Variables
The `GetSite` query requires an argument of type `GetSiteVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetSiteVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetSite` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSiteData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetSiteData {
  site?: {
    id: UUIDString;
    name: string;
    siteId: string;
    customDomain?: string | null;
  } & Site_Key;
}
```
### Using `GetSite`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSite, GetSiteVariables } from '@dataconnect/generated';

// The `GetSite` query requires an argument of type `GetSiteVariables`:
const getSiteVars: GetSiteVariables = {
  id: ..., 
};

// Call the `getSite()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSite(getSiteVars);
// Variables can be defined inline as well.
const { data } = await getSite({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSite(dataConnect, getSiteVars);

console.log(data.site);

// Or, you can use the `Promise` API.
getSite(getSiteVars).then((response) => {
  const data = response.data;
  console.log(data.site);
});
```

### Using `GetSite`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSiteRef, GetSiteVariables } from '@dataconnect/generated';

// The `GetSite` query requires an argument of type `GetSiteVariables`:
const getSiteVars: GetSiteVariables = {
  id: ..., 
};

// Call the `getSiteRef()` function to get a reference to the query.
const ref = getSiteRef(getSiteVars);
// Variables can be defined inline as well.
const ref = getSiteRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSiteRef(dataConnect, getSiteVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.site);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.site);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateProject
You can execute the `CreateProject` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createProject(vars: CreateProjectVariables): MutationPromise<CreateProjectData, CreateProjectVariables>;

interface CreateProjectRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProjectVariables): MutationRef<CreateProjectData, CreateProjectVariables>;
}
export const createProjectRef: CreateProjectRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createProject(dc: DataConnect, vars: CreateProjectVariables): MutationPromise<CreateProjectData, CreateProjectVariables>;

interface CreateProjectRef {
  ...
  (dc: DataConnect, vars: CreateProjectVariables): MutationRef<CreateProjectData, CreateProjectVariables>;
}
export const createProjectRef: CreateProjectRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createProjectRef:
```typescript
const name = createProjectRef.operationName;
console.log(name);
```

### Variables
The `CreateProject` mutation requires an argument of type `CreateProjectVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateProjectVariables {
  name: string;
  projectId: string;
}
```
### Return Type
Recall that executing the `CreateProject` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateProjectData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateProjectData {
  project_insert: Project_Key;
}
```
### Using `CreateProject`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createProject, CreateProjectVariables } from '@dataconnect/generated';

// The `CreateProject` mutation requires an argument of type `CreateProjectVariables`:
const createProjectVars: CreateProjectVariables = {
  name: ..., 
  projectId: ..., 
};

// Call the `createProject()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createProject(createProjectVars);
// Variables can be defined inline as well.
const { data } = await createProject({ name: ..., projectId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createProject(dataConnect, createProjectVars);

console.log(data.project_insert);

// Or, you can use the `Promise` API.
createProject(createProjectVars).then((response) => {
  const data = response.data;
  console.log(data.project_insert);
});
```

### Using `CreateProject`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createProjectRef, CreateProjectVariables } from '@dataconnect/generated';

// The `CreateProject` mutation requires an argument of type `CreateProjectVariables`:
const createProjectVars: CreateProjectVariables = {
  name: ..., 
  projectId: ..., 
};

// Call the `createProjectRef()` function to get a reference to the mutation.
const ref = createProjectRef(createProjectVars);
// Variables can be defined inline as well.
const ref = createProjectRef({ name: ..., projectId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createProjectRef(dataConnect, createProjectVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.project_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.project_insert);
});
```

## UpdateSite
You can execute the `UpdateSite` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateSite(vars: UpdateSiteVariables): MutationPromise<UpdateSiteData, UpdateSiteVariables>;

interface UpdateSiteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSiteVariables): MutationRef<UpdateSiteData, UpdateSiteVariables>;
}
export const updateSiteRef: UpdateSiteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateSite(dc: DataConnect, vars: UpdateSiteVariables): MutationPromise<UpdateSiteData, UpdateSiteVariables>;

interface UpdateSiteRef {
  ...
  (dc: DataConnect, vars: UpdateSiteVariables): MutationRef<UpdateSiteData, UpdateSiteVariables>;
}
export const updateSiteRef: UpdateSiteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateSiteRef:
```typescript
const name = updateSiteRef.operationName;
console.log(name);
```

### Variables
The `UpdateSite` mutation requires an argument of type `UpdateSiteVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateSiteVariables {
  id: UUIDString;
  customDomain?: string | null;
}
```
### Return Type
Recall that executing the `UpdateSite` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateSiteData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateSiteData {
  site_update?: Site_Key | null;
}
```
### Using `UpdateSite`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateSite, UpdateSiteVariables } from '@dataconnect/generated';

// The `UpdateSite` mutation requires an argument of type `UpdateSiteVariables`:
const updateSiteVars: UpdateSiteVariables = {
  id: ..., 
  customDomain: ..., // optional
};

// Call the `updateSite()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateSite(updateSiteVars);
// Variables can be defined inline as well.
const { data } = await updateSite({ id: ..., customDomain: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateSite(dataConnect, updateSiteVars);

console.log(data.site_update);

// Or, you can use the `Promise` API.
updateSite(updateSiteVars).then((response) => {
  const data = response.data;
  console.log(data.site_update);
});
```

### Using `UpdateSite`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateSiteRef, UpdateSiteVariables } from '@dataconnect/generated';

// The `UpdateSite` mutation requires an argument of type `UpdateSiteVariables`:
const updateSiteVars: UpdateSiteVariables = {
  id: ..., 
  customDomain: ..., // optional
};

// Call the `updateSiteRef()` function to get a reference to the mutation.
const ref = updateSiteRef(updateSiteVars);
// Variables can be defined inline as well.
const ref = updateSiteRef({ id: ..., customDomain: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateSiteRef(dataConnect, updateSiteVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.site_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.site_update);
});
```

