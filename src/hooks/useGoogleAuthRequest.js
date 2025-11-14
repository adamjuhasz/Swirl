import { useCallback, useEffect, useMemo, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { Alert } from 'react-native';
import { useAuth, buildRedirectUri } from '../context/AuthContext';

const SCOPES = ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/gmail.modify'];

export function useGoogleAuthRequest() {
  const { clientId, persistCredentials, persistUser, credentials } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const redirectUri = useMemo(() => buildRedirectUri(), []);

  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      responseType: 'code',
      clientId,
      scopes: SCOPES,
      redirectUri,
      usePKCE: true,
    },
    discovery,
  );

  useEffect(() => {
    if (!response || response.type !== 'success' || !response.params?.code) {
      return;
    }
    let isMounted = true;
    const exchangeAsync = async () => {
      setIsProcessing(true);
      try {
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId,
            code: response.params.code,
            redirectUri,
            extraParams: {
              code_verifier: request?.codeVerifier || '',
            },
          },
          discovery,
        );

        const expiresAt = Date.now() + (tokenResult.expires_in ? tokenResult.expires_in * 1000 : 0);
        await persistCredentials({
          accessToken: tokenResult.access_token,
          refreshToken: tokenResult.refresh_token || credentials?.refreshToken || null,
          idToken: tokenResult.id_token,
          expiresAt,
        });

        const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
          headers: { Authorization: `Bearer ${tokenResult.access_token}` },
        });
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          await persistUser({
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
          });
        }
      } catch (error) {
        console.warn('Google sign-in failed', error);
        Alert.alert('Sign in failed', error.message);
      } finally {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    };

    exchangeAsync();
    return () => {
      isMounted = false;
    };
  }, [clientId, discovery, persistCredentials, persistUser, redirectUri, request, response]);

  const initiate = useCallback(() => {
    if (!clientId) {
      Alert.alert('Configuration missing', 'Set EXPO_PUBLIC_GOOGLE_CLIENT_ID before signing in.');
      return;
    }
    if (!request) {
      Alert.alert('Please wait', 'Google sign-in is preparing.');
      return;
    }
    promptAsync({ useProxy: false, showInRecents: true }).catch((error) => {
      console.warn('Prompt async error', error);
    });
  }, [clientId, promptAsync, request]);

  return { initiate, isProcessing, isReady: !!request };
}
