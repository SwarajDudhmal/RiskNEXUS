"""
Test script for Credit Nexus application
Run this to verify models and preprocessing work correctly
"""

import sys
import os
from model_utils import ModelManager, create_sample_user_data
from preprocessing_pipeline import CreditRiskPreprocessor, UserDataProcessor

def test_model_loading():
    """Test if models load correctly"""
    print("🔄 Testing model loading...")
    
    model_manager = ModelManager()
    info = model_manager.model_info()
    
    print("Model Status:")
    for key, value in info.items():
        status = "✅" if value else "❌"
        print(f"  {status} {key}: {value}")
    
    return all([
        info.get('default_model_loaded', False),
        info.get('grade_model_loaded', False),
        info.get('scaler_loaded', False),
        info.get('preprocessor_available', False)
    ])

def test_preprocessing():
    """Test preprocessing pipeline"""
    print("\n🔄 Testing preprocessing pipeline...")
    
    try:
        # Create sample data
        sample_data = create_sample_user_data()
        print("✅ Sample data created")
        
        # Load model manager
        model_manager = ModelManager()
        
        if not model_manager.scaler:
            print("❌ Scaler not loaded")
            return False
        
        # Test preprocessor
        preprocessor = CreditRiskPreprocessor(model_manager.scaler)
        
        # Test validation
        is_valid, message = preprocessor.validate_user_input(sample_data)
        print(f"✅ Validation: {is_valid} - {message}")
        
        # Test preprocessing for default prediction
        processed_default = preprocessor.preprocess_for_default_prediction(sample_data)
        print(f"✅ Default preprocessing shape: {processed_default.shape}")
        print(f"   Features: {list(processed_default.columns)}")
        
        # Test preprocessing for grade prediction
        processed_grade = preprocessor.preprocess_for_grade_prediction(sample_data)
        print(f"✅ Grade preprocessing shape: {processed_grade.shape}")
        print(f"   Features: {list(processed_grade.columns)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Preprocessing error: {e}")
        return False

def test_predictions():
    """Test model predictions"""
    print("\n🔄 Testing model predictions...")
    
    try:
        # Create sample data
        sample_data = create_sample_user_data()
        
        # Load model manager
        model_manager = ModelManager()
        
        # Test default prediction
        print("Testing default risk prediction...")
        default_result = model_manager.predict_default_risk(sample_data)
        
        if "error" in default_result:
            print(f"❌ Default prediction error: {default_result['error']}")
            return False
        else:
            print("✅ Default prediction successful")
            print(f"   Risk Score: {default_result['risk_score']:.2f}%")
            print(f"   Risk Level: {default_result['risk_level']}")
            print(f"   Prediction: {'Default' if default_result['prediction'] == 1 else 'No Default'}")
        
        # Test grade prediction
        print("\nTesting grade prediction...")
        grade_result = model_manager.predict_credit_grade(sample_data)
        
        if "error" in grade_result:
            print(f"❌ Grade prediction error: {grade_result['error']}")
            return False
        else:
            print("✅ Grade prediction successful")
            print(f"   Predicted Grade: {grade_result['predicted_grade']}")
            print(f"   Confidence: {grade_result['confidence']:.2f}%")
            print(f"   Quality: {grade_result['grade_quality']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return False

def test_user_data_processor():
    """Test UserDataProcessor class"""
    print("\n🔄 Testing UserDataProcessor...")
    
    try:
        # Load model manager
        model_manager = ModelManager()
        
        if not model_manager.preprocessor:
            print("❌ Preprocessor not available")
            return False
        
        # Create processor
        processor = UserDataProcessor(model_manager.preprocessor)
        
        # Set sample data
        sample_data = create_sample_user_data()
        processor.set_user_data(sample_data)
        
        # Check validation
        is_valid = processor.is_valid()
        print(f"✅ Data validation: {is_valid}")
        
        if is_valid:
            # Test data export
            data_list = processor.export_to_list()
            data_dict = processor.export_to_dict()
            
            print(f"✅ Export to list: {len(data_list) if data_list else 0} features")
            print(f"✅ Export to dict: {len(data_dict) if data_dict else 0} features")
            
            # Test summary
            summary = processor.get_user_data_summary()
            print("✅ Data summary generated")
            print(f"   {summary[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ UserDataProcessor error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Credit Nexus Test Suite")
    print("=" * 50)
    
    # Check if model files exist
    model_files = [
        "Model/xgb_default_model.pkl",
        "Model/xgb_grade_model.pkl",
        "Model/scaler.pkl"
    ]
    
    print("📁 Checking model files...")
    for file in model_files:
        if os.path.exists(file):
            print(f"✅ {file} exists")
        else:
            print(f"❌ {file} not found")
            print(f"   Please ensure model files are in the Model directory")
            return False
    
    # Run tests
    tests = [
        ("Model Loading", test_model_loading),
        ("Preprocessing", test_preprocessing),
        ("Predictions", test_predictions),
        ("UserDataProcessor", test_user_data_processor)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Test {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*50)
    print("📊 TEST SUMMARY")
    print("="*50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! Your Credit Nexus app is ready to run.")
        print("\nTo start the app, run:")
        print("   streamlit run streamlit_app.py")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
    
    return passed == len(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)