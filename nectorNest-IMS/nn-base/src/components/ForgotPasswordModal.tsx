import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Typography,
  Divider,
} from '@thoughtstream/ui';
import { Mail, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSuccess?: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
  onSuccess,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sync initial email when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setError(null);
      setIsSubmitted(false);
    }
  }, [isOpen, initialEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setIsLoading(true);

    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      if (onSuccess) {
        onSuccess(email);
      }
    }, 1200);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setEmail('');
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      closeOnBackdropClick={!isLoading}
      closeOnEsc={!isLoading}
    >
      <ModalHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'var(--ts-color-surface-raised)',
              border: '1px solid var(--ts-border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ts-color-primary)',
            }}
          >
            <KeyRound size={18} />
          </div>
          <div>
            <ModalTitle>Reset Password</ModalTitle>
            <Typography
              variant="caption"
              color="secondary"
              style={{ display: 'block', marginTop: '2px' }}
            >
              NectorNest Identity Recovery Service
            </Typography>
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        {!isSubmitted ? (
          <form id="forgot-password-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <Typography variant="bodySmall" color="secondary">
                Enter the primary email address associated with your NectorNest account.
                We'll transmit a secure cryptographic recovery link valid for 15 minutes.
              </Typography>
            </div>

            <Input
              label="Work Email"
              type="email"
              placeholder="operator@nectornest.io"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              error={error || undefined}
              helperText={!error ? 'We will verify your workspace authorization' : undefined}
              leadingIcon={<Mail size={16} />}
              required
              autoFocus
              disabled={isLoading}
            />

            <div
              style={{
                marginTop: '20px',
                padding: '12px 16px',
                background: 'var(--ts-color-bg)',
                border: '1px solid var(--ts-border-subtle)',
              }}
            >
              <Typography variant="caption" color="secondary" style={{ display: 'block' }}>
                <strong>Security Notice:</strong> Recovery tokens are single-use and expire
                automatically. For enterprise SSO accounts, please reach out directly to your
                workspace administrator.
              </Typography>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--ts-status-success-bg, #F0FDF4)',
                border: '1px solid var(--ts-status-success-border, #BBF7D0)',
                color: 'var(--ts-color-success, #65A30D)',
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <Typography variant="subhead" style={{ marginBottom: '8px' }}>
              Check your inbox
            </Typography>

            <Typography variant="bodySmall" color="secondary" style={{ marginBottom: '16px' }}>
              Instructions to reset your password have been dispatched to{' '}
              <strong style={{ color: 'var(--ts-color-text-primary)' }}>{email}</strong>.
            </Typography>

            <Typography variant="caption" color="tertiary" style={{ display: 'block' }}>
              Didn't receive the email? Check your spam filter or request another token below.
            </Typography>
          </div>
        )}
      </ModalBody>

      <Divider spacing="small" />

      <ModalFooter>
        {!isSubmitted ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              width: '100%',
            }}
          >
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="forgot-password-form"
              variant="primary"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={16} />}
            >
              Send Instructions
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Button variant="ghost" size="small" onClick={handleReset}>
              Try another email
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </ModalFooter>
    </Modal>
  );
};
