# Republic AI Agent Examples

This directory contains example workflows demonstrating various use cases for the Republic AI Agent Orchestration Platform. Each example showcases different combinations of agents and their configurations for specific tasks.

## Available Examples

### 1. Social Media Automation (`social_media_automation.json`)
A comprehensive social media management workflow that:
- Researches and generates engaging content
- Adapts content for different platforms
- Manages distribution across multiple channels
- Tracks engagement and performance
- Provides analytics and insights

**Key Agents Used:**
- LangChain: Content research
- Eliza: Content creation and adaptation
- ZerePy: Social media distribution and analytics

### 2. Research Assistant (`research_assistant.json`)
An advanced research pipeline that:
- Conducts comprehensive literature review
- Analyzes and synthesizes findings
- Generates structured reports
- Creates visualizations and presentations
- Maintains academic rigor

**Key Agents Used:**
- LangChain: Initial research
- AutoGPT: Analysis and synthesis
- BabyAGI: Research organization
- Eliza: Report generation

### 3. Code Assistant (`code_assistant.json`)
A complete code development workflow that:
- Analyzes requirements
- Generates modular code
- Creates comprehensive tests
- Performs code review
- Generates documentation
- Packages the final output

**Key Agents Used:**
- LangChain: Requirements analysis
- AutoGPT: Code generation
- Eliza: Test creation
- BabyAGI: Code review
- ZerePy: Documentation

### 4. Learning Assistant (`learning_assistant.json`)
An adaptive learning system that:
- Assesses learner's current knowledge
- Creates personalized curriculum
- Generates interactive content
- Provides tutoring and feedback
- Tracks progress and adapts content
- Offers comprehensive analytics

**Key Agents Used:**
- LangChain: Skill assessment
- BabyAGI: Curriculum planning
- AutoGPT: Content generation
- Eliza: Tutoring
- ZerePy: Progress tracking

## Using the Examples

1. **Load an Example:**
   ```bash
   curl -X POST http://localhost:8080/load-flow \
     -H "Content-Type: application/json" \
     -d @examples/[example-file].json
   ```

2. **Modify Configuration:**
   - Update API keys in the node configurations
   - Adjust model parameters as needed
   - Customize agent behaviors for your use case

3. **Execute the Flow:**
   ```bash
   curl -X POST http://localhost:8080/execute-flow \
     -H "Content-Type: application/json" \
     -d @examples/[example-file].json
   ```

## Best Practices

1. **API Key Management:**
   - Use node-level API key configuration
   - Never commit API keys to version control
   - Use environment variables as fallback

2. **Model Selection:**
   - Choose models based on task complexity
   - Consider cost vs. performance tradeoffs
   - Use appropriate temperature settings

3. **Memory Configuration:**
   - Configure appropriate context windows
   - Use conversation memory for complex flows
   - Clear memory when starting new sessions

4. **Error Handling:**
   - Implement proper retry mechanisms
   - Set appropriate timeouts
   - Handle rate limits gracefully

## Contributing

Feel free to contribute additional examples by:
1. Creating a new example JSON file
2. Adding documentation to this README
3. Submitting a pull request

Please ensure your examples are:
- Well-documented
- Follow best practices
- Include clear use cases
- Demonstrate practical applications 