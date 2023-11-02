import { AxiosResponse } from "axios";
import { ReactFlowJsonObject } from "reactflow";
import { api } from "../../controllers/API/api";
import { APIObjectType, AssistantTypeAPI, sendAllProps } from "../../types/api/index";
import { FlowStyleType, FlowType, FolderType, NoteType, UserType } from "../../types/flow";
import {
  APIClassType,
  BuildStatusTypeAPI,
  InitTypeAPI,
  PromptTypeAPI,
  UploadFileTypeAPI,
  errorsTypeAPI,
} from "./../../types/api/index";
import { getAssistantFlow } from "../../utils/utils";
/**
 * Fetches all objects from the API endpoint.
 *
 * @returns {Promise<AxiosResponse<APIObjectType>>} A promise that resolves to an AxiosResponse containing all the objects.
 */
export async function getAll(): Promise<AxiosResponse<APIObjectType>> {
  return await api.get(`/api/v1/all`);
}

const GITHUB_API_URL = "https://api.github.com";

export async function getRepoStars(owner, repo) {
  try {
    const response = await api.get(`${GITHUB_API_URL}/repos/${owner}/${repo}`);
    return response.data.stargazers_count;
  } catch (error) {
    console.error("Error fetching repository data:", error);
    return null;
  }
}

/**
 * Sends data to the API for prediction.
 *
 * @param {sendAllProps} data - The data to be sent to the API.
 * @returns {AxiosResponse<any>} The API response.
 */
export async function sendAll(data: sendAllProps) {
  return await api.post(`/api/v1/predict`, data);
}

export async function postValidateCode(
  code: string
): Promise<AxiosResponse<errorsTypeAPI>> {
  return await api.post("/api/v1/validate/code", { code });
}

/**
 * Checks the prompt for the code block by sending it to an API endpoint.
 * @param {string} name - The name of the field to check.
 * @param {string} template - The template string of the prompt to check.
 * @param {APIClassType} frontend_node - The frontend node to check.
 * @returns {Promise<AxiosResponse<PromptTypeAPI>>} A promise that resolves to an AxiosResponse containing the validation results.
 */
export async function postValidatePrompt(
  name: string,
  template: string,
  frontend_node: APIClassType
): Promise<AxiosResponse<PromptTypeAPI>> {
  return await api.post("/api/v1/validate/prompt", {
    name: name,
    template: template,
    frontend_node: frontend_node,
  });
}

/**
 * Fetches a list of JSON files from a GitHub repository and returns their contents as an array of FlowType objects.
 *
 * @returns {Promise<FlowType[]>} A promise that resolves to an array of FlowType objects.
 */
export async function getExamples(): Promise<FlowType[]> {
  const url =
    "https://api.github.com/repos/logspace-ai/langflow_examples/contents/examples?ref=main";
  const response = await api.get(url);

  const jsonFiles = response.data.filter((file: any) => {
    return file.name.endsWith(".json");
  });

  const contentsPromises = jsonFiles.map(async (file: any) => {
    const contentResponse = await api.get(file.download_url);
    return contentResponse.data;
  });

  return await Promise.all(contentsPromises);
}

/**
 * Saves a new flow to the database.
 *
 * @param {FlowType} newFlow - The flow data to save.
 * @returns {Promise<any>} The saved flow data.
 * @throws Will throw an error if saving fails.
 */
export async function saveFlowToDatabase(newFlow: {
  name: string;
  id: string;
  folder_id:string;
  data: ReactFlowJsonObject;
  description: string;
  style?: FlowStyleType;
  user_id:string;
}): Promise<FlowType> {
  try {
    const response = await api.post("/api/v1/flows/", {
      folder_id:newFlow.folder_id,
      name: newFlow.name,
      data: newFlow.data,
      description: newFlow.description,
      user_id:newFlow.user_id,
    });

    if (response.status !== 201) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
/**
 * Updates an existing flow in the database.
 *
 * @param {FlowType} updatedFlow - The updated flow data.
 * @returns {Promise<any>} The updated flow data.
 * @throws Will throw an error if the update fails.
 */
export async function updateFlowInDatabase(
  updatedFlow: FlowType
): Promise<FlowType> {
  
  try {
    const response = await api.patch(`/api/v1/flows/${updatedFlow.id}`, {
      name: updatedFlow.name,
      data: updatedFlow.data,
      description: updatedFlow.description,
      folder_id: updatedFlow.folder_id,
      user_id: updatedFlow.user_id,
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Reads all flows from the database.
 *
 * @returns {Promise<any>} The flows data.
 * @throws Will throw an error if reading fails.
 */
export async function readFlowsFromDatabase(user_id:string) {

  try {
    const response = await api.get(`/api/v1/flows/all/${user_id}`);
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function downloadFlowsFromDatabase(user_id:string) {
  try {
    const response = await api.get(`/api/v1/flows/download/${user_id}`);
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function downloadFoldersFromDatabase(user_id:string) {
  try {
    const response = await api.get(`/api/v1/folders/download/${user_id}`);
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function downloadNotesFromDatabase(user_id:string) {
  try {
    const response = await api.get(`/api/v1/notes/download/${user_id}`);
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function uploadFlowsToDatabase(flows) {
  try {
    const response = await api.post(`/api/v1/flows/upload/`, flows);

    if (response.status !== 201) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function uploadAllToDatabase(allData,user_id:string) {
  try {
    const response = await api.post(`/api/v1/users/restore/${user_id}`, allData);
    
    if (response.status !== 201) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


/**
 * Deletes a flow from the database.
 *
 * @param {string} flowId - The ID of the flow to delete.
 * @returns {Promise<any>} The deleted flow data.
 * @throws Will throw an error if deletion fails.
 */
export async function deleteFlowFromDatabase(flowId: string) {
  try {
    const response = await api.delete(`/api/v1/flows/${flowId}`);
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Fetches a flow from the database by ID.
 *
 * @param {number} flowId - The ID of the flow to fetch.
 * @returns {Promise<any>} The flow data.
 * @throws Will throw an error if fetching fails.
 */
export async function getFlowFromDatabase(flowId: number) {
  try {
    const response = await api.get(`/api/v1/flows/${flowId}`);
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Fetches flow styles from the database.
 *
 * @returns {Promise<any>} The flow styles data.
 * @throws Will throw an error if fetching fails.
 */
export async function getFlowStylesFromDatabase() {
  try {
    const response = await api.get("/api/v1/flow_styles/");
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Saves a new flow style to the database.
 *
 * @param {FlowStyleType} flowStyle - The flow style data to save.
 * @returns {Promise<any>} The saved flow style data.
 * @throws Will throw an error if saving fails.
 */
export async function saveFlowStyleToDatabase(flowStyle: FlowStyleType) {
  try {
    const response = await api.post("/api/v1/flow_styles/", flowStyle, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 201) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Fetches the version of the API.
 *
 * @returns {Promise<AxiosResponse<any>>} A promise that resolves to an AxiosResponse containing the version information.
 */
export async function getVersion() {
  const respnose = await api.get("/api/v1/version");
  return respnose.data;
}

/**
 * Fetches the health status of the API.
 *
 * @returns {Promise<AxiosResponse<any>>} A promise that resolves to an AxiosResponse containing the health status.
 */
export async function getHealth() {
  return await api.get("/health"); // Health is the only endpoint that doesn't require /api/v1
}

/**
 * Fetches the build status of a flow.
 * @param {string} flowId - The ID of the flow to fetch the build status for.
 * @returns {Promise<BuildStatusTypeAPI>} A promise that resolves to an AxiosResponse containing the build status.
 *
 */
export async function getBuildStatus(
  flowId: string
): Promise<BuildStatusTypeAPI> {
  return await api.get(`/api/v1/build/${flowId}/status`);
}

//docs for postbuildinit
/**
 * Posts the build init of a flow.
 * @param {string} flowId - The ID of the flow to fetch the build status for.
 * @returns {Promise<InitTypeAPI>} A promise that resolves to an AxiosResponse containing the build status.
 *
 */
export async function postBuildInit(
  flow: FlowType,
  // nodeId?:string
): Promise<AxiosResponse<InitTypeAPI>> {
  let responseId=flow.id;
  // if(nodeId&&nodeId.length>0){
  //   responseId+="-"+nodeId
  // }
  return await api.post(`/api/v1/build/init/${responseId}`, flow);
}

// fetch(`/upload/${id}`, {
//   method: "POST",
//   body: formData,
// });
/**
 * Uploads a file to the server.
 * @param {File} file - The file to upload.
 * @param {string} id - The ID of the flow to upload the file to.
 */
export async function uploadFile(
  file: File,
  id: string
): Promise<AxiosResponse<UploadFileTypeAPI>> {
  const formData = new FormData();
  formData.append("file", file);
  return await api.post(`/api/v1/upload/${id}`, formData);
}

export async function postCustomComponent(
  code: string,
  apiClass: APIClassType
): Promise<AxiosResponse<APIClassType>> {
  return await api.post(`/api/v1/custom_component`, { code });
}


/**
 * Reads all folders from the database.
 *
 * @returns {Promise<any>} The folders data.
 * @throws Will throw an error if reading fails.
 */
export async function readFoldersFromDatabase(user_id:string) {
  try {
    // console.log("user_id:",user_id)
    const response = await api.get(`/api/v1/folders/all/${user_id}`);
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Saves a new folder to the database.
 *
 * @param {FolderType} newFolder - The folder data to save.
 * @returns {Promise<FolderType>} The saved folder data.
 * @throws Will throw an error if saving fails.
 */
export async function saveFolderToDatabase(newFolder: FolderType): Promise<FolderType> {
  try {
    const response = await api.post("/api/v1/folders/", {
      name: newFolder.name,
      description: newFolder.description,
      user_id:newFolder.user_id,
      parent_id:newFolder.parent_id,
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Updates an existing folder in the database.
 *
 * @param {FolderType} updatedFolder - The updated folder data.
 * @returns {Promise<FolderType>} The updated folder data.
 * @throws Will throw an error if the update fails.
 */
export async function updateFolderInDatabase(
  updatedFolder: FolderType
): Promise<FolderType> {
  try {
    const response = await api.patch(`/api/v1/folders/${updatedFolder.id}`, {
      name: updatedFolder.name,
      description: updatedFolder.description,
      user_id:updatedFolder.user_id,
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


/**
 * Deletes a folder from the database.
 *
 * @param {string} folderId - The ID of the folder to delete.
 * @returns {Promise<any>} The deleted folder data.
 * @throws Will throw an error if deletion fails.
 */
export async function deleteFolderFromDatabase(folderId: string) {
  try {
    const response = await api.delete(`/api/v1/folders/${folderId}`);
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


/**
 * Reads all notes from the database.
 *
 * @returns {Promise<any>} The notes data.
 * @throws Will throw an error if reading fails.
 */
export async function readNotesFromDatabase(user_id:string) {
  try {
    // console.log("user_id:",user_id)
    const response = await api.get(`/api/v1/notes/all/${user_id}`);
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Saves a new note to the database.
 *
 * @param {NoteType} newNote - The note data to save.
 * @returns {Promise<NoteType>} The saved note data.
 * @throws Will throw an error if saving fails.
 */
export async function saveNoteToDatabase(newNote: {
  name: string;
  id: string;
  content: {id:string,value:string};
  user_id:string;
  folder_id:string;
}): Promise<NoteType> {
  try {
    const response = await api.post("/api/v1/notes/", {
      name: newNote.name,
      content: newNote.content,
      user_id:newNote.user_id,
      folder_id:newNote.folder_id,
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
/**
 * Updates an existing note in the database.
 *
 * @param {NoteType} updatedNote - The updated note data.
 * @returns {Promise<NoteType>} The updated note data.
 * @throws Will throw an error if the update fails.
 */
export async function updateNoteInDatabase(
  updatedNote: NoteType
): Promise<NoteType> {
  try {
    const response = await api.patch(`/api/v1/notes/${updatedNote.id}`, {
      name: updatedNote.name,
      content: updatedNote.content,
      user_id:updatedNote.user_id,
      folder_id:updatedNote.folder_id,
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


/**
 * Deletes a note from the database.
 *
 * @param {string} noteId - The ID of the note to delete.
 * @returns {Promise<any>} The deleted note data.
 * @throws Will throw an error if deletion fails.
 */
export async function deleteNoteFromDatabase(noteId: string) {
  try {
    const response = await api.delete(`/api/v1/notes/${noteId}`);
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function loginUserFromDatabase(user:UserType) {
  try {
    
    const response = await api.post("/api/v1/users/", {
      name: user.name,
      password: user.password,
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Posts the notes of a flow.
 * @param {FlowType} flow -  The flow to post to assistant .
 * @returns {Promise<AssistantTypeAPI>} A promise that resolves to an AxiosResponse containing the build status.
 *
 */
export async function postNotesAssistant(
  flow: FlowType
): Promise<AxiosResponse<AssistantTypeAPI>> {
  let nodes=flow.data.nodes;
  let content="";
  if (nodes.length > 0) {
    nodes.forEach((node) => {
      if(node.type=="noteNode"){
        content+=node.data.value;
      }else{
        if(node.data.type=="Note"||node.data.type=="AINote"){
          content+=node.data.node.template.note.value;
        }
      }

    })
  }
  if(content.length>3){

    return await api.post(`/api/v1/assistant/${flow.id}`, flow);
  }
  return null;
  // ("result"={flowId:flow.id,msg:""});

}


