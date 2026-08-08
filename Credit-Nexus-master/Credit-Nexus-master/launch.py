"""
Launch script for Credit Nexus Streamlit App
"""

import subprocess
import sys
import os
import time

def check_dependencies():
    """Check if required packages are installed"""
    required_packages = [
        'streamlit', 'pandas', 'numpy', 'scikit-learn', 
        'xgboost', 'joblib', 'matplotlib', 'seaborn'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("Please install them using: pip install -r requirements.txt")
        return False
    
    print("✅ All required packages found")
    return True

def check_model_files():
    """Check if model files exist"""
    model_files = [
        "Model/xgb_default_model.pkl",
        "Model/xgb_grade_model.pkl", 
        "Model/scaler.pkl"
    ]
    
    missing_files = []
    
    for file in model_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing model files: {', '.join(missing_files)}")
        print("Please ensure model files are in the Model/ directory")
        return False
    
    print("✅ All model files found")
    return True

def run_tests():
    """Run the test suite"""
    print("🧪 Running tests...")
    
    try:
        result = subprocess.run([sys.executable, "test_app.py"], 
                              capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("✅ All tests passed")
            return True
        else:
            print("❌ Some tests failed")
            print(result.stdout)
            if result.stderr:
                print("Errors:", result.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Tests timed out")
        return False
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False

def launch_streamlit():
    """Launch the Streamlit app"""
    print("🚀 Launching Credit Nexus App...")
    print("The app will open in your default browser")
    print("Press Ctrl+C to stop the app")
    print("-" * 50)
    
    try:
        # Launch streamlit
        subprocess.run([sys.executable, "-m", "streamlit", "run", "streamlit_app.py"])
    except KeyboardInterrupt:
        print("\n👋 App stopped by user")
    except Exception as e:
        print(f"❌ Error launching app: {e}")

def main():
    """Main launch function"""
    print("🌟 Credit Nexus - Launch Script")
    print("=" * 40)
    
    # Pre-flight checks
    print("Performing pre-flight checks...")
    
    if not check_dependencies():
        print("\n❌ Dependency check failed")
        return False
    
    if not check_model_files():
        print("\n❌ Model file check failed")
        return False
    
    # Ask user if they want to run tests
    run_test = input("\nRun tests before launching? (y/n): ").lower().strip()
    
    if run_test in ['y', 'yes']:
        if not run_tests():
            continue_anyway = input("\nTests failed. Continue anyway? (y/n): ").lower().strip()
            if continue_anyway not in ['y', 'yes']:
                print("Aborting launch")
                return False
    
    print("\n" + "=" * 40)
    print("🎉 All checks passed! Launching app...")
    time.sleep(2)
    
    # Launch the app
    launch_streamlit()
    
    return True

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Launch cancelled by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)