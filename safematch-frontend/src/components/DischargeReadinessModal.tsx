import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { X, CheckCircle2, XCircle, AlertTriangle, FileCheck } from 'lucide-react';

interface DischargeReadinessModalProps {
  mother?: any;
  newborn?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DischargeReadinessModal({ mother: initialMother, newborn: initialNewborn, onClose, onSuccess }: DischargeReadinessModalProps) {
  const [mothers, setMothers] = useState<any[]>([]);
  const [newborns, setNewborns] = useState<any[]>([]);
  const [selectedMother, setSelectedMother] = useState<any>(initialMother);
  const [selectedNewborn, setSelectedNewborn] = useState<any>(initialNewborn);
  const [readinessData, setReadinessData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [decisionData, setDecisionData] = useState({
    decision_status: 'pending',
    decision_notes: '',
    discharge_instructions: '',
    follow_up_required: false,
    follow_up_date: '',
    actual_discharge_date: '',
  });

  useEffect(() => {
    if (!initialMother) {
      fetchMothers();
    }
    if (initialMother && initialNewborn) {
      fetchReadiness(initialMother.id, initialNewborn.id);
    }
  }, []);

  const fetchMothers = async () => {
    try {
      const response = await axios.get('/mothers?status=active');
      setMothers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching mothers:', error);
    }
  };

  const fetchNewborns = async (motherId: number) => {
    try {
      const response = await axios.get(`/newborns?mother_id=${motherId}&status=active`);
      setNewborns(response.data.data || []);
    } catch (error) {
      console.error('Error fetching newborns:', error);
    }
  };

  const fetchReadiness = async (motherId: number, newbornId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`/discharge/readiness/${motherId}/${newbornId}`);
      setReadinessData(response.data);
      
      // Pre-fill decision form if exists
      if (response.data.discharge_decision) {
        setDecisionData({
          decision_status: response.data.discharge_decision.decision_status,
          decision_notes: response.data.discharge_decision.decision_notes || '',
          discharge_instructions: response.data.discharge_decision.discharge_instructions || '',
          follow_up_required: response.data.discharge_decision.follow_up_required || false,
          follow_up_date: response.data.discharge_decision.follow_up_date || '',
          actual_discharge_date: response.data.discharge_decision.actual_discharge_date || '',
        });
      }
    } catch (error) {
      console.error('Error fetching readiness:', error);
      alert('Failed to load discharge readiness');
    } finally {
      setLoading(false);
    }
  };

  const handleMotherChange = async (motherId: string) => {
    const mother = mothers.find(m => m.id === parseInt(motherId));
    setSelectedMother(mother);
    setSelectedNewborn(null);
    setReadinessData(null);
    
    if (mother) {
      await fetchNewborns(mother.id);
    }
  };

  const handleNewbornChange = async (newbornId: string) => {
    const newborn = newborns.find(n => n.id === parseInt(newbornId));
    setSelectedNewborn(newborn);
    
    if (newborn && selectedMother) {
      await fetchReadiness(selectedMother.id, newborn.id);
    }
  };

  const handleToggleRequirement = async (requirement: any, isNewborn: boolean) => {
    try {
      await axios.post('/discharge/requirement', {
        mother_id: selectedMother.id,
        newborn_id: isNewborn ? selectedNewborn.id : null,
        discharge_requirement_id: requirement.requirement.id,
        is_completed: !requirement.is_completed,
      });

      // Refresh readiness
      await fetchReadiness(selectedMother.id, selectedNewborn.id);
    } catch (error) {
      console.error('Error updating requirement:', error);
      alert('Failed to update requirement');
    }
  };

  const handleSaveDecision = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMother || !selectedNewborn) {
      alert('Please select mother and newborn');
      return;
    }

    try {
      await axios.post('/discharge/decision', {
        mother_id: selectedMother.id,
        newborn_id: selectedNewborn.id,
        ...decisionData,
      });

      alert('Discharge decision saved successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving decision:', error);
      alert('Failed to save discharge decision');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Discharge Readiness Assessment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Patient Selection */}
          {!initialMother && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Mother <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedMother?.id || ''}
                  onChange={(e) => handleMotherChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Mother</option>
                  {mothers.map((mother) => (
                    <option key={mother.id} value={mother.id}>
                      {mother.full_name} ({mother.mother_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Newborn <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedNewborn?.id || ''}
                  onChange={(e) => handleNewbornChange(e.target.value)}
                  disabled={!selectedMother}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select Newborn</option>
                  {newborns.map((newborn) => (
                    <option key={newborn.id} value={newborn.id}>
                      {newborn.full_name || 'Unnamed'} ({newborn.newborn_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : readinessData ? (
            <>
              {/* Readiness Status */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Readiness Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    {readinessData.readiness.mother_ready ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Mother</p>
                      <p className="font-semibold text-gray-900">
                        {readinessData.readiness.mother_ready ? 'Ready' : 'Not Ready'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {readinessData.readiness.newborn_ready ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Newborn</p>
                      <p className="font-semibold text-gray-900">
                        {readinessData.readiness.newborn_ready ? 'Ready' : 'Not Ready'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {readinessData.readiness.overall_ready ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Overall</p>
                      <p className="font-semibold text-gray-900">
                        {readinessData.readiness.overall_ready ? 'Ready for Discharge' : 'Requirements Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mother Requirements */}
              {readinessData.mother_requirements.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mother Requirements</h3>
                  <div className="space-y-3">
                    {readinessData.mother_requirements.map((req: any) => (
                      <div
                        key={req.requirement.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={req.is_completed}
                            onChange={() => handleToggleRequirement(req, false)}
                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{req.requirement.name}</p>
                            {req.requirement.description && (
                              <p className="text-sm text-gray-600">{req.requirement.description}</p>
                            )}
                            {req.requirement.is_mandatory && (
                              <span className="text-xs text-red-600">Mandatory</span>
                            )}
                          </div>
                        </div>
                        {req.is_completed && (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Newborn Requirements */}
              {readinessData.newborn_requirements.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Newborn Requirements</h3>
                  <div className="space-y-3">
                    {readinessData.newborn_requirements.map((req: any) => (
                      <div
                        key={req.requirement.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={req.is_completed}
                            onChange={() => handleToggleRequirement(req, true)}
                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{req.requirement.name}</p>
                            {req.requirement.description && (
                              <p className="text-sm text-gray-600">{req.requirement.description}</p>
                            )}
                            {req.requirement.is_mandatory && (
                              <span className="text-xs text-red-600">Mandatory</span>
                            )}
                          </div>
                        </div>
                        {req.is_completed && (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discharge Decision Form */}
              <div className="border-t pt-6">
                {!showDecisionForm ? (
                  <button
                    onClick={() => setShowDecisionForm(true)}
                    className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold text-sm sm:text-base"
                  >
                    <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                    Make Discharge Decision
                  </button>
                ) : (
                  <form onSubmit={handleSaveDecision} className="space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Discharge Decision</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Decision Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={decisionData.decision_status}
                          onChange={(e) => setDecisionData({ ...decisionData, decision_status: e.target.value })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="on_hold">On Hold</option>
                          <option value="discharged">Discharged</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Actual Discharge Date
                        </label>
                        <input
                          type="date"
                          value={decisionData.actual_discharge_date}
                          onChange={(e) => setDecisionData({ ...decisionData, actual_discharge_date: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Decision Notes
                      </label>
                      <textarea
                        value={decisionData.decision_notes}
                        onChange={(e) => setDecisionData({ ...decisionData, decision_notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discharge Instructions
                      </label>
                      <textarea
                        value={decisionData.discharge_instructions}
                        onChange={(e) => setDecisionData({ ...decisionData, discharge_instructions: e.target.value })}
                        rows={4}
                        placeholder="Provide discharge instructions for the patient..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={decisionData.follow_up_required}
                          onChange={(e) => setDecisionData({ ...decisionData, follow_up_required: e.target.checked })}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-700">Follow-up Required</span>
                      </label>

                      {decisionData.follow_up_required && (
                        <input
                          type="date"
                          value={decisionData.follow_up_date}
                          onChange={(e) => setDecisionData({ ...decisionData, follow_up_date: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowDecisionForm(false)}
                        className="px-4 sm:px-6 py-2 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition order-2 sm:order-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-primary text-white rounded-lg hover:bg-primary-dark transition order-1 sm:order-2"
                      >
                        Save Decision
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {initialMother && initialNewborn ? 
                'Loading readiness data...' : 
                'Please select a mother and newborn to check discharge readiness'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
