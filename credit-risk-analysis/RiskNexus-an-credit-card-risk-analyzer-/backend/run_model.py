import sys
import os

# Add current directory to path so we can import services
sys.path.append(os.getcwd())

from services.prediction_services import calculate_credit_score

def run_demo():
    # Sample input data matching the frontend form
    data = {
        'age': 35,
        'income': 75000,
        'debt': 15000,
        'creditCardUtilization': 30,
        'openCreditLines': 5,
        'creditHistoryLength': 10
    }

    print("\n" + "="*50)
    print(" CREDIT RISK MODEL - TERMINAL DEMO")
    print("="*50)
    print("\nInput Data:")
    for key, value in data.items():
        print(f"  - {key}: {value}")

    print("\nCalculating score...")
    
    # Run the logic
    try:
        result = calculate_credit_score(data)
        
        print("\n" + "-"*30)
        print(" RESULTS")
        print("-"*30)
        print(f"Credit Score: {result['creditScore']}")
        print(f"Summary:      {result['summary']}")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"\nError running model: {e}")

if __name__ == "__main__":
    run_demo()
