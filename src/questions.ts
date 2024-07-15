import _ from "lodash";

class Questions {
    constructor() {}

    random_question():string {
        const questions = [
          "how are you feeling today?",
          "what are you avoiding?",
          "what do you feel in your body?",
          "what do you desire?",
          "what are you grateful for?",
          "what movement things are you doing today? What else could you do later?",
          "what are you curious about today?",
          "what are you proud of?",
          "what did you hold back on saying?",
          "what have you been doing to rest?",
          "what are some NVC needs that are being met or not met?"
        ]
    
        return _.sample(questions) || questions[0]
    
      }

}

export default Questions;