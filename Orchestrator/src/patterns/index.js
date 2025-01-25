class PatternMatcher {
  constructor() {
    this.patterns = [
      {
        pattern: /\b(i am|i'm)\s+([^.!?]*)/i,
        type: 'self-reflection',
        responses: [
          'Why do you say that you are %2?',
          'How long have you been %2?',
          'How do you feel about being %2?'
        ]
      },
      {
        pattern: /\b(i feel|i am feeling)\s+([^.!?]*)/i,
        type: 'emotional',
        responses: [
          'Tell me more about feeling %2.',
          'Do you often feel %2?',
          'What makes you feel %2?'
        ]
      },
      {
        pattern: /\b(i want|i need)\s+([^.!?]*)/i,
        type: 'desire',
        responses: [
          'What would it mean to you if you got %2?',
          'Why do you want %2?',
          'What would you do if you got %2?'
        ]
      },
      {
        pattern: /\b(i think)\s+([^.!?]*)/i,
        type: 'belief',
        responses: [
          'Why do you think %2?',
          'What makes you think %2?',
          'Are you sure that %2?'
        ]
      },
      {
        pattern: /\b(always|never)\b/i,
        type: 'absolute',
        responses: [
          'Can you think of a specific example?',
          'Really? Every single time?',
          "Are you sure it's that absolute?"
        ]
      },
      {
        pattern: /\b(because|cause)\s+([^.!?]*)/i,
        type: 'reasoning',
        responses: [
          'Is that the real reason?',
          'What other reasons might there be?',
          'Does that reason explain anything else?'
        ]
      },
      {
        pattern: /\b(my (?:mother|father|sister|brother|family))\s+([^.!?]*)/i,
        type: 'family',
        responses: [
          'Tell me more about your family.',
          'How do you feel about %1?',
          'How does %1 make you feel when they %2?'
        ]
      }
    ];

    this.defaultResponses = [
      'Please tell me more about that.',
      'How does that make you feel?',
      'Can you elaborate on that?',
      'Why do you say that?',
      'I see. Please continue.',
      'That's interesting. Can you tell me more?'
    ];
  }

  findMatch(input) {
    for (const pattern of this.patterns) {
      const match = input.match(pattern.pattern);
      if (match) {
        return {
          type: pattern.type,
          responses: pattern.responses.map(response => 
            this.formatResponse(response, match)),
          match: match
        };
      }
    }
    return null;
  }

  formatResponse(template, match) {
    let response = template;
    for (let i = 1; i < match.length; i++) {
      response = response.replace(`%${i}`, match[i] || '');
    }
    return response;
  }

  getResponse(input, config = {}) {
    const match = this.findMatch(input);
    if (!match) {
      return {
        type: 'default',
        response: this.getRandomResponse(this.defaultResponses)
      };
    }

    const { reflectionLevel = 0.5, empathyLevel = 0.5 } = config;
    
    // Higher reflection level means more likely to use pattern-based responses
    if (Math.random() < reflectionLevel) {
      return {
        type: match.type,
        response: this.getRandomResponse(match.responses)
      };
    }

    // Fall back to default responses with empathy-based selection
    return {
      type: 'default',
      response: this.getEmpathicResponse(empathyLevel)
    };
  }

  getRandomResponse(responses) {
    const index = Math.floor(Math.random() * responses.length);
    return responses[index];
  }

  getEmpathicResponse(empathyLevel) {
    const empathicResponses = [
      'I understand how you feel.',
      'That must be difficult for you.',
      'I hear you.',
      'Your feelings are valid.',
      'I'm here to listen.'
    ];

    // Higher empathy level means more likely to use empathic responses
    if (Math.random() < empathyLevel) {
      return this.getRandomResponse(empathicResponses);
    }

    return this.getRandomResponse(this.defaultResponses);
  }
}

module.exports = {
  PatternMatcher
}; 