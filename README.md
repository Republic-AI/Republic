# Republic - AI Agent Orchestration Platform

![Republic AI Agent Orchestration Platform](image.png)

A powerful visual flow-based platform for orchestrating AI agents. Republic enables you to create, connect, and manage sophisticated AI agent workflows through an intuitive drag-and-drop interface, supporting multiple agent frameworks and seamless integration with various AI services.

## 🌟 Key Features

### Visual Flow Editor
- Intuitive drag-and-drop interface
- Real-time flow visualization
- Dynamic node connections
- Live preview of agent configurations
- Custom node styling and grouping

### Agent Frameworks

#### 🔍 LangChain Agent
A flexible, general-purpose language model agent:

- **Key Features**
  - Tool-using capabilities
  - Web search integration
  - Document analysis
  - Memory management
  - Chain-of-thought reasoning
  
- **Use Cases**
  - Research and analysis
  - Content generation
  - Question answering
  - Data extraction
  - Process automation

#### 🤓 AutoGPT Agent
An autonomous agent capable of breaking down and executing complex tasks:

- **Core Features**
  - Goal-oriented task execution
  - Self-prompted task planning
  - Tool utilization
  - Long-term memory
  - Recursive task refinement
  
- **Capabilities**
  - Web research
  - Content creation
  - Code generation
  - Data analysis
  - Project planning

#### 👶 BabyAGI Agent
A task management and execution agent focused on iterative improvement:

- **Key Features**
  - Task prioritization
  - Objective breakdown
  - Result analysis
  - Vector memory storage
  - Learning optimization
  
- **Applications**
  - Project planning
  - Research organization
  - Learning optimization
  - Knowledge management
  - Process improvement

#### 🤖 Eliza Agent Framework
A sophisticated conversational agent inspired by the classic ELIZA program, enhanced with modern AI capabilities:

- **Personality & Adaptation**
  - Configurable personality traits
  - Dynamic emotional state tracking
  - Context-aware responses
  - Adaptive conversation styles
  - Memory-based personalization
  
- **Advanced Features**
  - Pattern-based response generation
  - Emotional memory system
  - Conversation history analysis
  - Multi-turn dialogue management
  - Natural language understanding
  
- **Integration Capabilities**
  - Discord bot functionality
  - Twitter API integration
  - Telegram bot support
  - Custom webhook support
  - Real-time event handling

#### 🚀 ZerePy Agent Framework
A versatile social media management and engagement agent:

- **Core Capabilities**
  - Multi-platform content creation
  - Engagement strategy optimization
  - Audience analysis and insights
  - Content scheduling
  - Performance analytics
  
- **Platform Support**
  - Twitter engagement and analytics
  - Farcaster social protocol integration
  - Discord community management
  - Cross-platform coordination
  - API rate limit handling
  
- **Smart Features**
  - Content performance tracking
  - Automated response generation
  - Engagement pattern analysis
  - Sentiment analysis
  - Trend detection

## 🛠 Setup

### Prerequisites
- Docker and Docker Compose
- Node.js v18+ (for local development only)
- Python 3.8+ (for local development only)
- API Keys:
  - OpenAI API key (required for GPT models)
  - Anthropic API key (optional for Claude models)
  - Platform-specific API keys (as needed)

### API Key Configuration

There are two ways to configure API keys:

1. **Node Configuration (Recommended)**
   - Each AI agent node has a dedicated API key field in its configuration
   - API keys are stored securely and used only for specific nodes
   - Configure keys in node settings under "AI Model Configuration"
   - Supports per-node API key rotation and management

2. **Environment Variables (Alternative)**
   - Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here
   ```
   - These will be used as fallback if no API key is provided in node configuration
   - Supports global API key management

Note: For security, API keys in node configurations are encrypted at rest and masked in the UI.

### Installation

#### Option 1: Using Docker (Recommended)

1. **Clone the Repository**
```bash
git clone https://github.com/Republic-AI/Republic.git
cd republic
```

2.  **Set up environment variables:**

    *   Create a `.env` file in the `node-llm-service/` directory.
    *   Add your API keys to the `.env` file, following the example in `node-llm-service/.env`.  **Important:**  Replace the placeholder values with your actual API keys.  For example:

        ```
        OPENAI_API_KEY=your_openai_api_key
        TWITTER_BEARER_TOKEN=your_twitter_bearer_token
        SOLANA_RPC_URL=your_solana_rpc_url
        ```
    *   You may also need to set `TWITTER_RAPIDAPI_KEY` in your `.env` file if you are using a RapidAPI proxy for Twitter access.

3.  **Build and run the application:**

    ```bash
    docker-compose up --build
    ```

    This command will build the Docker images for the frontend and backend and start the containers.

4.  **Access the application:**

    Open your web browser and go to `http://localhost:3000`.

## Multi-Agent Example: Copy Transaction

This example demonstrates a pre-built multi-agent system for monitoring and copying transactions.

1.  **Access the Multi-agent Marketplace:** In the left sidebar, click on the "Multi-agent Marketplace" section.
2.  **Create the Flow:** Click the "Copy Transaction" button. This will automatically create and connect the following nodes:
    *   **Instruction Sticker:** Provides instructions on how to use the flow.
    *   **Twitter KOL List:** Add Twitter accounts of Key Opinion Leaders (KOLs) to monitor.
    *   **Twitter Agent:**  Fetches tweets from the specified KOLs.  **Make sure to check the "CA Mode" checkbox in the Twitter Agent's configuration.** This enables contract address extraction.
    *   **Analyst Agent:** Analyzes the extracted contract addresses based on configurable parameters.
    *   **Webview Node (K Chart):** Displays a K-line chart for the analyzed token (if available).
    *   **Trading Agent:**  (Currently a placeholder)  Would be used to execute trades based on the analysis.
3.  **Configure the Nodes:**
    *   **Twitter KOL List:** Add the Twitter usernames of the KOLs you want to follow (e.g., `satoshi_back`, `elonmusk`).
    *   **Twitter Agent:** Ensure "CA Mode" is checked.
    *   **Analyst Agent:** Set the desired analysis parameters (market cap, liquidity, etc.).  Connect a contract address to the input of this node, or type one into the input box.
    *   **Trading Agent:** Configure the trading parameters (buy/sell amounts, stop-loss, etc.).
4.  **Run the Flow:** Click the "Run Flow" button at the bottom of the sidebar.  The agents will execute in sequence, and the results will be displayed in the connected nodes.

This "Copy Transaction" flow demonstrates how multiple agents can be combined to create a powerful and automated workflow. You can customize this flow or build your own multi-agent systems by connecting different agent types.