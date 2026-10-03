/**
 * gemini.ts
 * Using gemini to create a listing
 * @AshokSaravanan222
 * 09-18-2024
 */
"use server"

type CreateListingJSONOutput = {
    title: string;
    price: number;
    negotiable: boolean;
    condition: string;
    category: number;
    description: string;
}

const conditionIds: { [key: string]: string } = {
    "new": "new",
    "like new": "used (like new)",
    "good": "used (good)",
    "fair": "used (fair)"
};

const categoryIds: { [key: string]: number } = {
    "misc": 0,
    "tickets": 1,
    "electronics": 2,
    "dorm": 3,
    "textbooks": 4,
    "clothing": 5,
    "transport": 6,
    "media": 7,
    "furniture": 8,
    "lesuire": 9,
    "tools": 10,
    "leases": 11
};

// for schedule
export type ScheduleJSONOutput = {
    monday: number[],
    tuesday: number[],
    wednesday: number[],
    thursday: number[],
    friday: number[],
    saturday: number[],
    sunday: number[],
}



const {
    GoogleGenerativeAI,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);


export const createListing = async (imageFormData: FormData): Promise<CreateListingJSONOutput | null> => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are a marketplace enthusiast, with expert knowledge in items that are popular and trending on platforms like eBay, Facebook Marketplace, and OfferUp. You specialize in items that college students need, and understand what sorts of items interest them. You are to help people create listings on a college marketplace platform, providing your best estimate of the title, price, if the price is negotiable, condition, cateogrory, and description based on product images. You will use the following criteria in generating these fields: \n\ntitle -- Enter a short description of the item name. \nprice -- Enter a price above $1.00.\nnegotiable --  If enabled, the price can be negotiated during the meetup.\ncondition -- Describe the condition of your item, so people know what to expect.\ncategory -- Pick 1 category that suits your item. Misceallenous can be used if you are unsure.\ndescription -- Add a short description of your item. We recommend at least 1-2 sentences or 3 bullet points.",
        });

        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
            responseSchema: {
                type: "object",
                properties: {
                    title: {
                        type: "string"
                    },
                    price: {
                        type: "integer"
                    },
                    negotiable: {
                        type: "boolean"
                    },
                    condition: {
                        type: "string",
                        enum: [
                            "new",
                            "like new",
                            "good",
                            "fair"
                        ]
                    },
                    category: {
                        type: "string",
                        enum: [
                            "misc",
                            "tickets",
                            "electronics",
                            "dorm",
                            "textbooks",
                            "clothing",
                            "transport",
                            "media",
                            "furniture",
                            "lesuire",
                            "tools",
                            "leases"
                        ]
                    },
                    description: {
                        type: "string"
                    }
                },
                required: [
                    "title",
                    "price",
                    "negotiable",
                    "condition",
                    "category",
                    "description"
                ]
            },
        };


        const prompt = "Using the following picture as the item, generate the title, price, if the price is negotiable, condition, category, and description based on product images. Follow these instructions: \n\n1. Try to identify the specific brand in the image when creating the title and description. \n2. ENSURE that the output for 'condition' is the one most closely related to the specified values: 'new', 'like new', 'good', or 'fair'.\n3. ENSURE that the output for 'category' is the one most closely related to the specified values: 'misc', 'tickets', 'electronics', 'dorm', 'textbooks', 'clothing', 'transport', 'media', 'furniture', 'lesuire', 'tools', or 'leases'.\n4. Make sure the outputs are in JSON format. \nYour response: ";
        const photo = imageFormData.get("image") as File;
        const arrayBuffer = await photo.arrayBuffer();

        // Convert the ArrayBuffer to a Base64 string
        const base64String = Buffer.from(arrayBuffer).toString('base64');

        const image = {
            inlineData: {
                data: base64String,
                mimeType: photo.type,
            },
        };

        const result = await model.generateContent([prompt, image], generationConfig);
        const rawOutput = result.response.text()
        // output has ```json``` in the beginning, so we need to remove it
        const cleanedOutput = rawOutput.replace("```json", "").replace("```", "");
        const output = JSON.parse(cleanedOutput);
        console.log(output);

        // want to make sure that there is a valid output
        const possibleConditions = ["new", "like new", "good", "fair"];
        const condition = possibleConditions.includes(String(output.condition).toLowerCase()) ? conditionIds[output.condition] : "new";

        const possibleCategories = Object.keys(categoryIds);
        const category = possibleCategories.includes(String(output.category).toLowerCase()) ? categoryIds[output.category] : 0;

        return {
            title: output.title || "",
            price: output.price || 0,
            negotiable: output.negotiable || false,
            condition: condition || "new",
            category: category || 0,
            description: output.description || "",
        };
    } catch (error) {
        console.error(error);
        return null
    }
}


export const createSchedule = async (times: string): Promise<ScheduleJSONOutput | null> => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are a scheduler assistant, masterful in converting written text of schedules into a technical form that will be shown below. You should take note to how people list their descriptions, for individual days of the week like 'monday', 'tuesday', 'wednesday', e.t.c, keywords like 'weekdays', 'weekends', 'daily', e.t.c, and individual times like 6-8pm, 4:00-4:30 am, seven o clock, e.t.c. Your goal is to map the interpretation of a schedule string to an array of times (represented by numbers 1-48 for each 30-minute timeslot in a given day) for each of the days of the week (monday, tuesday, wednesday, thursday, friday, saturday, sunday).\n For example, the input string 'sundays 6-8pm' will parse to all days of the week being empty (monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: []) with sunday having entries for these 2 hours (sunday: [37, 38, 39, 40]). ",
        });

        // can worry about custom days later. Right now just add to general.

        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
            responseSchema: {
                type: "object",
                properties: {
                    monday: {
                        type: "array",
                        items: {
                            type: "number"
                        }
                    },
                    tuesday: {
                        type: "array",
                        items: {
                            type: "number"
                        }
                    },
                    wednesday: {
                        type: "array",
                        items: {
                            type: "number"
                        }
                    },
                    thursday: {
                        type: "array",
                        items: {
                            type: "number"
                        }
                    },
                    friday: {
                        type: "array",
                        items: {
                            type: "number"
                        }
                    },
                    saturday: {
                        type: "array",
                        items: {
                            type: "number"
                        }
                    },
                    sunday: {
                        type: "array",
                        items: {
                            type: "number"
                        }
                    }
                },
                required: [
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday"
                ]
            },
        };


        const prompt = "Using the following schedule string, convert it into the technical form, having an array of numbers (1-48) for each one of the days of the week. Make the outputs in JSON format. \nYour response: ";

        const result = await model.generateContent([prompt, times], generationConfig);
        const rawOutput = result.response.text()
        // output has ```json``` in the beginning, so we need to remove it
        const cleanedOutput = rawOutput.replace("```json", "").replace("```", "");
        const output = JSON.parse(cleanedOutput);
        console.log(output);

        return {
            monday: output.monday || [],
            tuesday: output.tuesday || [],
            wednesday: output.wednesday || [],
            thursday: output.thursday || [],
            friday: output.friday || [],
            saturday: output.saturday || [],
            sunday: output.sunday || [],
        };
    } catch (error) {
        console.error(error);
        return null
    }
}