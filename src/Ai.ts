import { GoogleGenAI } from "@google/genai";


async function GetTopic(topic : string): Promise<String | undefined> {
    const api = process.env.GEMINI_API_KEY;
    if (!api) {
        console.log("api key not found");
        return undefined;
    }
    const ai = new GoogleGenAI({ apiKey: api });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "You are a revision bot , whose job is to revise any random subtopic from the given topic with example to a college student , so that he is prepared when placements come , you need to present the data in a way so that its understandable and provides deeper understanding to student with brief explainations and examples. for choosing any topic for given topic search any college curriculum or website and revise different subtopic every time. \n The topic for which you need to give revision content is " + topic + "dont give unecessary description like (i am your revision bot ,you are aspiring....) , etc" ,
    });
    return response.text?.toString();
}

export default GetTopic;