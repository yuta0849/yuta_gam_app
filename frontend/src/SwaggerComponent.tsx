import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerComponent = () => {
    const apiUrl = process.env.REACT_APP_SWAGGER_API_URL;
    return (
      <SwaggerUI url={apiUrl} />
  );
};

export default SwaggerComponent;