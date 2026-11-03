import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

export const useT = () => useContext(LanguageContext);
