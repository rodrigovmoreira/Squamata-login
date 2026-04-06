import React, { useState, useEffect } from 'react';
import {
  Container, Tabs, Input, Button, Text, VStack, Heading, Card, Alert, Flex
} from '@chakra-ui/react';
import { authAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dispatch } = useApp();

  const [appSlug, setAppSlug] = useState('calango-bot');
  const [tenantId, setTenantId] = useState('default');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slugParams = params.get('app');
    const tenantParams = params.get('tenant');
    if (slugParams) setAppSlug(slugParams);
    if (tenantParams) setTenantId(tenantParams);
  }, []);

  const appNameLabel = appSlug === 'calango-food' 
    ? 'Calango Food' 
    : appSlug === 'calango-bot' 
      ? 'Calango Bot' 
      : 'Calango Inc.';

  const handleAuthSuccess = (response) => {
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'SET_USER', payload: user });
    
    alert(`Sucesso! Token gerado para App: ${appSlug}`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      appSlug,
      tenantId
    };

    try {
      const response = await authAPI.login(data);
      handleAuthSuccess(response);
    } catch (error) {
      // Como sugerido no plano de homologação, caso não encontre, tentamos criar (Auto-mocking for Dev)
      if(error.response?.status === 404) {
        try {
          const registerResponse = await authAPI.register({ ...data, name: 'Usuário Teste' });
          handleAuthSuccess(registerResponse);
          return;
        } catch(registerErr) {
           setError('Erro ao auto-criar usuário de testes');
        }
      } else {
        setError(error.response?.data?.message || 'Erro de conexão com o servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" direction={{ base: 'column', md: 'row' }}>
      <Flex
        flex={1}
        bgGradient="to-br" 
        gradientFrom="green.500"
        gradientVia="green.600"
        gradientTo="purple.500"
        justify="center"
        align="center"
        direction="column"
        p={8}
        color="white"
      >
        <VStack gap={6}>
            <Heading size="2xl" fontWeight="bold">Login - {appNameLabel}</Heading>
            <Text fontSize="xl" opacity={0.9}>Ecossistema Central de Autenticação</Text>
        </VStack>
      </Flex>

      <Flex
        flex={1}
        bg="gray.50"
        _dark={{ bg: 'gray.900' }}
        justify="center"
        align="center"
        p={4}
      >
        <Container maxW="md">
           <VStack gap={8} w="full">
              <Card.Root w="full" borderRadius="xl" boxShadow="xl" bg="white" _dark={{ bg: 'gray.800' }}>
                <Card.Body p={8}>
                    <VStack gap={6}>
                        <Heading size="lg" textAlign="center">
                            Acessar Plataforma
                        </Heading>
                        
                        {error && (
                            <Alert.Root status="error">
                              <Alert.Title>{error}</Alert.Title>
                            </Alert.Root>
                        )}

                        <Tabs.Root defaultValue="login" variant="enclosed" width="100%">
                            <Tabs.List>
                                <Tabs.Trigger value="login" flex={1}>Login / Registro de Teste</Tabs.Trigger>
                            </Tabs.List>

                            <Tabs.Content value="login" px={0} mt={4}>
                                <VStack gap={4}>
                                    <Button w="full" variant="outline" onClick={() => window.location.href = `http://localhost:3001/api/v1/auth/google`}>
                                        <FcGoogle /> Continuar com Google
                                    </Button>

                                    <Text fontSize="sm" color="gray.500">ou</Text>

                                    <form onSubmit={handleLogin} style={{ width: '100%' }}>
                                        <VStack gap={4}>
                                            <Input name="email" type="email" placeholder="seu@email.com" size="lg" required />
                                            <Input name="password" type="password" placeholder="Sua senha" size="lg" required />
                                        <Button type="submit" colorPalette="green" size="lg" width="100%" loading={loading}>
                                            Entrar
                                        </Button>
                                        </VStack>
                                    </form>
                                </VStack>
                            </Tabs.Content>
                        </Tabs.Root>

                        <Text fontSize="sm" color="gray.500" textAlign="center">
                            Homologação Simplificada Calango Inc.
                        </Text>
                    </VStack>
                </Card.Body>
              </Card.Root>
           </VStack>
        </Container>
      </Flex>
    </Flex>
  );
};

export default Login;
