// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { StorageKeys, storageUtils } from '../utils/storageUtils';

export default function ProtectedRoute({ children }) {
  const token = storageUtils.get(StorageKeys.TOKEN);
  return token ? children : <Navigate to="/login" replace />;
}