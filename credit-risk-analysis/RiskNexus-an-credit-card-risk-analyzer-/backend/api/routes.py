from flask import Blueprint, request, jsonify
from services.prediction_services import calculate_credit_score, predict_impact, get_recommendations

api_bp = Blueprint('api', __name__)

@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Backend is running'})

@api_bp.route('/calculate-score', methods=['POST'])
def calculate_score():
    try:
        data = request.json
        result = calculate_credit_score(data)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@api_bp.route('/predict-impact', methods=['POST'])
def predict_score_impact():
    try:
        data = request.json
        action = data.get('action')
        details = data.get('details')
        current_score = data.get('currentScore')
        
        result = predict_impact(action, details, current_score)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@api_bp.route('/recommendations', methods=['POST'])
def get_personal_recommendations():
    try:
        data = request.json
        result = get_recommendations(data)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400
