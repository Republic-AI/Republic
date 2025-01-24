// Helper function to extract the actual result content from agent outputs
function extractAgentResult(result) {
  // If result is already a string, return it
  if (typeof result === 'string') {
    return result;
  }
  
  // If result is null or undefined, return empty string
  if (!result) {
    return '';
  }

  try {
    // If result is a string that looks like JSON, parse it
    if (typeof result === 'string' && (result.startsWith('{') || result.startsWith('['))) {
      result = JSON.parse(result);
    }

    // If result is an object
    if (typeof result === 'object') {
      // If it has a content/output property, use that
      if (result.content) return result.content;
      if (result.output) return result.output;
      if (result.result) return result.result;
      if (result.response) return result.response;
      if (result.text) return result.text;
      if (result.message) return result.message;
      
      // If it's an array, join the elements
      if (Array.isArray(result)) {
        return result.map(item => 
          typeof item === 'object' ? JSON.stringify(item) : String(item)
        ).join('\n');
      }

      // If it has only one key, use its value
      const keys = Object.keys(result);
      if (keys.length === 1) {
        return extractAgentResult(result[keys[0]]);
      }

      // If it has multiple keys and none of them are our expected output keys,
      // stringify the entire object
      return JSON.stringify(result, null, 2);
    }
  } catch (error) {
    console.error('Error extracting result:', error);
    return String(result);
  }

  // For any other type, convert to string
  return String(result);
}

// Handle input node execution
const executeInputNode = async (input, config) => {
  try {
    let result;
    switch (config.inputType) {
      case 'text':
        result = input;
        break;

      case 'file':
        // Files are handled by the frontend and passed as base64
        result = config.fileUpload;
        break;

      case 'api':
        const response = await axios({
          method: config.apiMethod,
          url: config.apiEndpoint,
          headers: JSON.parse(config.apiHeaders || '{}'),
          data: JSON.parse(config.apiBody || '{}')
        });
        result = JSON.stringify(response.data);
        break;

      default:
        result = input;
    }
    return result;
  } catch (error) {
    console.error('Error executing input node:', error);
    return `Error: ${error.message}`;
  }
};

// Handle output node execution
const executeOutputNode = async (input, config) => {
  try {
    // If input is an array of results from multiple nodes
    if (Array.isArray(input)) {
      const formattedResults = input.map(item => {
        if (typeof item === 'string' && item.includes('Results from')) {
          return item; // Already formatted
        }
        return typeof item === 'object' ? 
          extractAgentResult(item) : 
          String(item);
      });
      return formattedResults.join('\n\n');
    }
    
    // Handle single input
    return typeof input === 'object' ? 
      extractAgentResult(input) : 
      String(input);
  } catch (error) {
    console.error('Error executing output node:', error);
    return `Error: ${error.message}`;
  }
};

module.exports = {
  extractAgentResult,
  executeInputNode,
  executeOutputNode
}; 