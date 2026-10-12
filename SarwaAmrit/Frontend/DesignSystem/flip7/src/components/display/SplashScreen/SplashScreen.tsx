import React from 'react';
import { Logo } from '../../brand/Logo';
import { Loader } from '../Loader';
import './SplashScreen.css';

export interface SplashScreenProps {
  banner?: string;
  message?: string;
  className?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  banner = 'THE CARD GAME',
  message = 'Shuffling the deck…',
  className = '',
}) => (
  <div className={['f7-splash', className].filter(Boolean).join(' ')}>
    <Logo banner={banner} />
    <Loader label={message} />
  </div>
);
SplashScreen.displayName = 'SplashScreen';
