from langflow.template import frontend_node

# These should always be instantiated
CUSTOM_NODES = {
    # "prompts": {
    #     "ZeroShotPrompt": frontend_node.prompts.ZeroShotPromptNode(),
    # },

    "tools": {
        "PythonFunctionTool": frontend_node.tools.PythonFunctionToolNode(),
        "PythonFunction": frontend_node.tools.PythonFunctionNode(),
        # "TestFunction": frontend_node.tools.TestFunctionNode(),
        # "Note":frontend_node.notes.NoteFrontendNode(),
        # "AINote":frontend_node.notes.AINoteFrontendNode(),
        "Tool": frontend_node.tools.ToolNode(),
    },
    "agents": {
        "JsonAgent": frontend_node.agents.JsonAgentNode(),
        "CSVAgent": frontend_node.agents.CSVAgentNode(),
        "AgentInitializer": frontend_node.agents.InitializeAgentNode(),
        "VectorStoreAgent": frontend_node.agents.VectorStoreAgentNode(),
        "VectorStoreRouterAgent": frontend_node.agents.VectorStoreRouterAgentNode(),
        "SQLAgent": frontend_node.agents.SQLAgentNode(),
    },
    "utilities": {
        "SQLDatabase": frontend_node.agents.SQLDatabaseNode(),
    },
    "memories": {
        "PostgresChatMessageHistory": frontend_node.memories.PostgresChatMessageHistoryFrontendNode(),
        "MongoDBChatMessageHistory": frontend_node.memories.MongoDBChatMessageHistoryFrontendNode(),
    },
    "chains": {
        "SeriesCharacterChain": frontend_node.chains.SeriesCharacterChainNode(),
        "TimeTravelGuideChain": frontend_node.chains.TimeTravelGuideChainNode(),
        "MidJourneyPromptChain": frontend_node.chains.MidJourneyPromptChainNode(),
        "load_qa_chain": frontend_node.chains.CombineDocsChainNode(),
    },
    "custom_components": {
        "CustomComponent": frontend_node.custom_components.CustomComponentFrontendNode(),
        "TranslaterComponent": frontend_node.custom_components.TranslaterFrontendNode(),
        "ArticleGeneraterComponent": frontend_node.custom_components.ArticleGeneraterFrontendNode(),
        "ArticleStructureComponent": frontend_node.custom_components.ArticleStructureFrontendNode(),
        "VideoScriptComponent":frontend_node.custom_components.VideoScriptFrontendNode(),
        "HandlerComponent":frontend_node.custom_components.HandlerFrontendNode(),



    },
    "notes":{
        "Note":frontend_node.notes.NoteFrontendNode(),
        "AINote":frontend_node.notes.AINoteFrontendNode(),
        "CustomPrompt":frontend_node.notes.CustomPromptFrontendNode(),
    },
}


def get_custom_nodes(node_type: str):
    """Get custom nodes."""
    return CUSTOM_NODES.get(node_type, {})
