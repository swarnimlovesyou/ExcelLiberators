from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import tempfile
import shutil
import zipfile
from msoffcrypto import OfficeFile

app = FastAPI()

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/unlock/")
async def unlock_excel_files(
    files: List[UploadFile] = File(...),
    password: str = Form(...),
):
    # Validate files
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    # Check file types
    for file in files:
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(status_code=400, 
                               detail=f"Invalid file format: {file.filename}. Only Excel files (.xlsx, .xls) are supported.")
    
    # Create temporary directories
    temp_dir = tempfile.mkdtemp()
    output_dir = tempfile.mkdtemp()
    
    try:
        # Process each file
        for file in files:
            # Save the uploaded file
            temp_file_path = os.path.join(temp_dir, file.filename)
            with open(temp_file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Process the Excel file to remove password
            output_file_path = os.path.join(output_dir, file.filename)
            
            try:
                # Open the encrypted file
                office_file = OfficeFile(open(temp_file_path, "rb"))
                
                # Decrypt the file with the provided password
                try:
                    office_file.load_key(password=password)
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"Invalid password or corrupted file: {str(e)}")
                
                # Save the decrypted file
                with open(output_file_path, "wb") as f:
                    office_file.decrypt(f)
                
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error processing file {file.filename}: {str(e)}")
        
        # Create a zip file containing all unlocked files
        zip_path = os.path.join(temp_dir, "unlocked_excel_files.zip")
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for file_name in os.listdir(output_dir):
                file_path = os.path.join(output_dir, file_name)
                zipf.write(file_path, arcname=file_name)
        
        # Return the zip file
        return FileResponse(
            path=zip_path,
            media_type="application/zip",
            filename="unlocked_excel_files.zip"
        )
        
    finally:
        # Clean up temporary files when response is sent
        shutil.rmtree(output_dir, ignore_errors=True)
        # We'll keep temp_dir for the zip file to be served

@app.get("/")
async def root():
    return {"message": "Bulk Excel Unlocker API is running"}