import GetTopic from "./src/Ai.ts"
import start from './src/Wa.ts'
import removeMd from "remove-markdown";

const input = ["dbms/sql",
    "os",
    "computer networks",
    "dsa",
    "oops java",
    "ai/ml",
    "llms/transformers",
    "devops/docker/vms",
    "react.js",
    "node.js/express.js",
    "any random (not first) leetcode problem"]


try {
    const choice = input[Math.floor(Math.random() * input.length)];
    const result = await GetTopic(choice);
    if (result){
        const text = removeMd(result.toString());
        start(text);
        
    }
} catch (error) {
    console.error("Error:", error);
}