import React, { useState } from 'react';
import { Loader2, Sparkles, CheckCircle, X } from 'lucide-react';

export default function PersonalizedRecommendations({ data }) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const onGetRecommendations = async () => {
    setIsLoading(true);
    setRecommendations([]);
    
    try {
        const response = await fetch('http://localhost:5000/api/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            setRecommendations(result.data.recommendations);
        } else {
            alert(result.error || "Failed to get recommendations");
        }
    } catch (err) {
        alert("Network error");
    } finally {
        setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    onGetRecommendations();
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center justify-center transition-colors"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Get Personalized Tips
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b">
                <div>
                    <h3 className="text-lg font-semibold">Personalized Recommendations</h3>
                    <p className="text-sm text-gray-500 mt-1">AI-generated tips to improve your score</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                </button>
            </div>
            
            <div className="p-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-sm text-gray-500">Analyzing your profile...</p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700 leading-relaxed">{rec}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            <div className="bg-gray-50 p-4 flex justify-end">
                <button 
                    onClick={() => setIsOpen(false)}
                    className="py-2 px-4 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm font-medium"
                >
                    Close
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
