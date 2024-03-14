import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerComponent = () => {
  return (
    <SwaggerUI url="path-to-your-openapi-spec-file.yaml" />
  );
};

export default SwaggerComponent;