"use client";

import React from "react";
import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { senderOptions } from "./senderOptions";

const ReactSelectField = ({ field, form, options, ...props }) => {
  const selectedOption =
    options.find((option) => option.value === field.value) || null;
  return (
    <Select
      {...props}
      value={selectedOption}
      onChange={(option) => form.setFieldValue(field.name, option.value)}
      options={options}
    />
  );
};

const EmailSchema = Yup.object().shape({
  sender: Yup.string()
    .email("Invalid email address")
    .required("Sender email is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Primary email is required"),
  bcc: Yup.array()
    .of(Yup.string().email("Invalid email address"))
    .min(1, "At least one BCC email is required")
    .required("BCC emails are required"),
});

export default function Home() {
  const initialValues = {
    sender: "",
    email: "",
    bcc: [""],
  };

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setStatus }
  ) => {
    try {
      const payload = {
        sender: values.sender,
        email: values.email,
        bcc: values.bcc.filter((bcc) => bcc.trim() !== ""),
      };

      let apiAddress = "/api/send-email";

      if (values.sender == "invitesender86@gmail.com") {
        apiAddress = "/api/send";
      }

      const response = await fetch(apiAddress, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus({ success: "Emails were sent successfully!" });
        resetForm();
      } else {
        const errorData = await response.json();
        setStatus({ error: errorData.message || "Failed to send emails." });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus({ error: "An unexpected error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl mb-4">Send Invitation</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={EmailSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, status }) => (
          <Form>
            <div className="mb-4">
              <label
                htmlFor="sender"
                className="block text-sm font-medium mb-1"
              >
                Sender Email
              </label>
              <Field
                name="sender"
                component={ReactSelectField}
                options={senderOptions}
                placeholder="Select sender email"
              />
              <ErrorMessage
                name="sender"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Primary Email
              </label>
              <Field
                type="email"
                name="email"
                id="email"
                className="w-full px-3 py-2 border rounded"
                placeholder="recipient@example.com"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                BCC Emails
              </label>
              <FieldArray name="bcc">
                {({ push, remove }) => (
                  <div>
                    {values.bcc.map((bcc, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <Field
                          type="email"
                          name={`bcc[${index}]`}
                          className="flex-1 px-3 py-2 border rounded"
                          placeholder={`bcc${index + 1}@example.com`}
                        />
                        {values.bcc.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="ml-2 text-red-500"
                            aria-label={`Remove BCC email ${index + 1}`}
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}
                    <ErrorMessage
                      name="bcc"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                )}
              </FieldArray>
            </div>

            {status && status.success && (
              <div className="mb-4 text-green-500">{status.success}</div>
            )}
            {status && status.error && (
              <div className="mb-4 text-red-500">{status.error}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
