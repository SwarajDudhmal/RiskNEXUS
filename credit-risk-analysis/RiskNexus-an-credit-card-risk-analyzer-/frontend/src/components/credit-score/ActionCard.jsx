import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';

export default function ActionCard({ config, currentScore, onScoreUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const { register, handleSubmit, watch, setValue } = useForm();
  const { fields } = config;

  // Set default values
  useEffect(() => {
    if (fields) {
      fields.forEach(field => {
        setValue(field.name, field.defaultValue);
      });
    }
  }, [fields, setValue]);
  
  const paramValues = watch();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setResult(null);

    let details = config.description;
    if (fields) {
        details = fields.map(field => `${field.label}: ${data[field.name]}${field.unit || ''}`).join(', ');
    }

    try {
      const response = await fetch('http://localhost:5000/api/predict-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: config.actionText,
            details: details,
            currentScore: currentScore
        })
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setResult(resData.data);
      } else {
        alert(resData.error || "Failed to predict impact");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChange = () => {
    if (result) {
      onScoreUpdate(result.scoreImpact);
      setResult(null);
    }
  };

  const Icon = config.icon;

  return (
    <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Icon className="h-8 w-8 text-primary mt-1" />
          <div>
            <CardTitle className="text-lg font-bold">{config.title}</CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-500">{config.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields?.map((field) => (
            <div key={field.name} className="space-y-2">
              <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">{field.label}</label>
                  <span className="text-sm font-bold text-primary">
                    {paramValues[field.name] || field.defaultValue}{field.unit}
                  </span>
              </div>
              <input
                type="range"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                min={field.min}
                max={field.max}
                step={field.step}
                {...register(field.name)}
              />
            </div>
          ))}
          
          <div className="pt-2">
             {!result ? (
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  Simulate Impact
                </button>
             ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className={`p-3 rounded-md border ${result.scoreImpact >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm">Estimated Impact:</span>
                            <span className={`font-bold ${result.scoreImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {result.scoreImpact > 0 ? '+' : ''}{result.scoreImpact} points
                            </span>
                        </div>
                        <p className="text-xs text-gray-600">{result.explanation}</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            type="button" 
                            onClick={() => setResult(null)}
                            className="flex-1 py-2 px-3 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={handleApplyChange}
                            className="flex-1 py-2 px-3 bg-primary text-primary-foreground rounded hover:opacity-90 text-sm font-medium"
                            style={{ backgroundColor: '#1a1a1a', color: 'white' }}
                        >
                            Apply Change
                        </button>
                    </div>
                </div>
             )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
