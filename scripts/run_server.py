import subprocess
import sys
import os

def install_requirements():
    """Install required Python packages"""
    print("Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "scripts/requirements.txt"])
        print("✅ Dependencies installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False
    return True

def run_server():
    """Run the FastAPI server"""
    print("Starting FastAPI server...")
    try:
        # Change to the scripts directory to run the backend
        os.chdir("scripts")
        subprocess.run([sys.executable, "backend.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error running server: {e}")

if __name__ == "__main__":
    print("🚀 Health Assessment API Setup")
    print("=" * 40)
    
    if install_requirements():
        print("\n📡 Starting server on http://localhost:8000")
        print("📚 API docs will be available at http://localhost:8000/docs")
        print("🔄 Press Ctrl+C to stop the server\n")
        run_server()
    else:
        print("❌ Setup failed. Please check the error messages above.")
