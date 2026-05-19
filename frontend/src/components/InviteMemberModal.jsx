import React, { useState } from 'react';
import Modal from './Modal';

const InviteMemberModal = ({ isOpen, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please add a member email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await onInvite(email);
      setSuccess(`Successfully added team member: ${email}`);
      setEmail('');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err || 'Failed to add project member. Ensure their email is registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Member to Project Workspace">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
            {success}
          </div>
        )}

        <div>
          <label 
            htmlFor="invite-member-email" 
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
          >
            Registered User Email Address
          </label>
          <input
            id="invite-member-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. coworker@company.com"
            className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 px-3.5 py-2.5 text-sm text-slate-200 outline-none transition-standard focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
          />
          <span className="block text-[10px] text-slate-400 mt-2">
            * Note: Only registered accounts on Synapse can be added.
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-950/60 hover:text-slate-200 transition-standard"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/10 hover:brightness-110 active:scale-98 transition-standard disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteMemberModal;
