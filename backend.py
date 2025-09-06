from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import base64
import json
from typing import Union, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini AI
api_key = os.getenv("API_KEY")
if not api_key:
    raise ValueError("API_KEY environment variable not set")

genai.configure(api_key=api_key)

# Initialize FastAPI app
app = FastAPI(title="Multilingual Government Form Translator API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def file_to_base64(file_content: bytes, content_type: str) -> str:
    """Convert file content to base64 string"""
    return base64.b64encode(file_content).decode('utf-8')

async def translate_and_simplify_form(
    input: Union[bytes, str],
    input_type: str,
    target_language: str,
    file_name: str = None,
    content_type: str = None
) -> Dict[str, Any]:
    """
    Translate and simplify government forms using Gemini AI
    
    Args:
        input: File content (bytes) or text content (str)
        input_type: 'file' or 'text'
        target_language: Target language for translation
        file_name: Name of the file (for file input)
        content_type: MIME type of the file (for file input)
    
    Returns:
        Dict containing the translation result
    """
    
    base_prompt = f"""
    You are an expert multilingual translator and form structure analyst for government documents.
    Your tasks are:
    1.  Identify the source language.
    2.  Translate all text into {target_language}.
    3.  Reconstruct the form's structure with high fidelity. Group elements that appear on the same horizontal line into a single "row" object. Any element that is clearly separate from the main flow of numbered fields, like a box for a photograph, should be put in its own dedicated section.
    4.  For each element on the form, identify its type. Use 'text' for a fillable text field (which can be a box or an underlined space), 'checkbox' for a tickable square box, 'photo' for an area to attach a photograph, and 'label' for any text that is not an interactive field itself but provides information (like "Gender" before the checkboxes).
    5.  If you encounter a table, represent it as a single section. The first row in that section should contain the table headers. Set a special flag 'isTable' to true for this section. The 'type' for all table cells should be 'text'.
    6.  Extract the original numbering for each field (e.g., "01.", "(k)") into the 'originalNumber' field. The 'label' field must contain ONLY the translated text, EXCLUDING the number. For 'checkbox' types, the label is the text next to the box.
    7.  Provide a simplified, easy-to-understand explanation of the form's purpose in {target_language}.

    Return a single, structured JSON object according to the provided schema. Note that a single "row" can contain a mix of element types, for example a 'label' followed by two 'checkbox' fields.
    """
    
    # Define the response schema
    response_schema = {
        "type": "object",
        "properties": {
            "formTitle": {
                "type": "string",
                "description": f"The main title of the form, translated into {target_language}."
            },
            "sections": {
                "type": "array",
                "description": "An array of form sections.",
                "items": {
                    "type": "object",
                    "properties": {
                        "sectionTitle": {
                            "type": "string",
                            "description": f"The title of this section, translated into {target_language}."
                        },
                        "isTable": {
                            "type": "boolean",
                            "description": "Set to true if this section represents a table. If so, the first row should contain the table headers."
                        },
                        "rows": {
                            "type": "array",
                            "description": "An array of rows, where each row contains fields that appear on the same horizontal line. For tables, the first row is the header.",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "fields": {
                                        "type": "array",
                                        "description": "An array of fields (or cells) within this row.",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "originalNumber": {
                                                    "type": "string",
                                                    "description": "The original number or letter of the field (e.g., '01.', '(a)')."
                                                },
                                                "label": {
                                                    "type": "string",
                                                    "description": f"The field label or header text, translated into {target_language}. This should NOT include the original number."
                                                },
                                                "type": {
                                                    "type": "string",
                                                    "description": "The type of form element. Can be 'text', 'checkbox', 'photo', or 'label'."
                                                }
                                            },
                                            "required": ["label", "type"]
                                        }
                                    }
                                }
                            }
                        },
                        "description": {
                            "type": "string",
                            "description": f"An optional description for the section, translated into {target_language}."
                        }
                    },
                    "required": ["sectionTitle", "rows"]
                }
            },
            "simplification": {
                "type": "string",
                "description": f"A simplified, easy-to-understand explanation of the form in {target_language}, broken down into clear points."
            }
        },
        "required": ["formTitle", "sections", "simplification"]
    }
    
    try:
        # Initialize the model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        if input_type == "file":
            # Handle file input
            file_content = input
            base64_data = file_to_base64(file_content, content_type)
            
            # Create the prompt for file analysis
            prompt = f"{base_prompt}\n\nAnalyze the attached form image or PDF."
            
            # Create the content with file
            content = [
                {
                    "mime_type": content_type,
                    "data": base64_data
                },
                prompt
            ]
        else:
            # Handle text input
            text_content = input
            prompt = f"{base_prompt}\n\nAnalyze the following form text content:\n---\n{text_content}\n---"
            content = [prompt]
        
        # Generate content with structured output
        response = model.generate_content(
            content,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=response_schema
            )
        )
        
        # Parse the JSON response
        json_string = response.text.strip()
        parsed_result = json.loads(json_string)
        
        # Basic validation to ensure the response shape is correct
        if (
            parsed_result and 
            isinstance(parsed_result.get("formTitle"), str) and
            isinstance(parsed_result.get("sections"), list) and
            isinstance(parsed_result.get("simplification"), str)
        ):
            return parsed_result
        else:
            raise ValueError("Invalid response format from API. The JSON structure is incorrect.")
            
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON response from AI service: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to process the form: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Multilingual Government Form Translator API is running"}

@app.post("/api/translate")
async def translate_form(
    target_language: str = Form(...),
    input_type: str = Form(...),
    file: Union[UploadFile, None] = File(None),
    text_content: Union[str, None] = Form(None)
):
    """
    Translate and simplify government forms using Gemini AI
    """
    try:
        # Validate input
        if input_type not in ["file", "text"]:
            raise HTTPException(status_code=400, detail="Invalid input_type. Must be 'file' or 'text'")
        
        if input_type == "file" and not file:
            raise HTTPException(status_code=400, detail="File is required when input_type is 'file'")
        
        if input_type == "text" and not text_content:
            raise HTTPException(status_code=400, detail="Text content is required when input_type is 'text'")
        
        # Process the request
        if input_type == "file":
            # Read file content
            file_content = await file.read()
            result = await translate_and_simplify_form(
                input=file_content,
                input_type="file",
                target_language=target_language,
                file_name=file.filename,
                content_type=file.content_type
            )
        else:
            result = await translate_and_simplify_form(
                input=text_content,
                input_type="text",
                target_language=target_language
            )
        
        return JSONResponse(content=result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

