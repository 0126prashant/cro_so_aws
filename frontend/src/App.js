import React, { useState } from "react";
import {
  Box,
  Button,
  Center,
  ChakraProvider,
  Input,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import "./App.css";

function App() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [urlError, setUrlError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // console.log("screenshotsData",screenshotsData)
  const handleGenerateScreenshots = async () => {
    setUrlError(false);
    setError(null);
    if (!websiteUrl) {
      setUrlError(true);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/screenshots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: websiteUrl }),
      });
  
      if (response.ok) {
        const data = await response.json();     
      }
       else {
        const errorMessage = await response.text();
        setError(`Server error: ${response.status} - ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error in frontend:", error.message);
      setError(`Error in frontend: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <ChakraProvider>
      <VStack spacing="4" align="center">
        <Box textAlign="center" padding="4">
          <Text fontSize="4xl" color="#37474F">
            Screenshot Generator
          </Text>

          <Box marginBottom="4">
            <Input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              padding="2"
              width="300px"
              required
              disabled={loading}
            />
            {urlError && (
              <Text color="red" marginTop="2">
                Please provide a valid URL.
              </Text>
            )}

            {error && (
              <Text color="red" marginTop="2">
                {error}
              </Text>
            )}
          </Box>

          <Button
            onClick={handleGenerateScreenshots}
            padding="4"
            backgroundColor="#2196F3"
            border="none"
            cursor="pointer"
            opacity={loading ? 0.5 : 1}
            disabled={loading}
          >
            {loading ? "Please wait..." : "Take Screenshot"}
          </Button>
        </Box>

        {loading && (
          <Center textAlign="center" padding="4">
            Loading...
            <Spinner
              css={css`
                margin-top: rem;
              `}
            />
          </Center>
        )}
      </VStack>
    </ChakraProvider>
  );
}


export default App;




