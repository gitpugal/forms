import * as React from "react";

interface EmailTemplateProps {
  responses: any[];
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  responses,
}) => (
  <div>
    <h1>Form responses</h1>
  </div>
);
