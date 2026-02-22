import React from "react";

import Address from "@/components/Address/Address";
import AddressBook from "@/components/AddressBook/AddressBook";
import Form from "@/components/Form/Form";
import Radio from "@/components/Radio/Radio";
import Section from "@/components/Section/Section";
import useAddressBook from "@/hooks/useAddressBook";
import useFormFields from "@/hooks/useFormFields";
import transformAddress, { RawAddressModel } from "./core/models/address";

import { Address as AddressType } from "./types";

const INITIAL_FORM_STATE = {
  postCode: "",
  houseNumber: "",
  firstName: "",
  lastName: "",
  selectedAddress: "",
};

function App() {
  const form = useFormFields(INITIAL_FORM_STATE);
  const [error, setError] = React.useState<undefined | string>(undefined);
  const [addresses, setAddresses] = React.useState<AddressType[]>([]);
  const [addressLoading, setAddressLoading] = React.useState(false);
  const { addAddress } = useAddressBook();

  const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setAddresses([]);
    form.setValues((prev: typeof INITIAL_FORM_STATE) => ({
      ...prev,
      selectedAddress: "",
    }));

    const { postCode, houseNumber } = form.values;

    if (!postCode.trim() || !houseNumber.trim()) {
      setError("Postcode and street number fields mandatory!");
      return;
    }
    if (postCode.length < 4) {
      setError("Postcode must be at least 4 digits!");
      return;
    }
    if (!/^\d+$/.test(postCode)) {
      setError("Postcode must be all digits and non negative!");
      return;
    }
    if (!/^\d+$/.test(houseNumber)) {
      setError("Street Number must be all digits and non negative!");
      return;
    }

    setAddressLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_URL || "";
      const url = `${baseUrl}/api/getAddresses?postcode=${encodeURIComponent(postCode)}&streetnumber=${encodeURIComponent(houseNumber)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(data.errormessage || "Something went wrong");
        return;
      }
      if (data.status === "ok" && data.details) {
        const transformed = data.details.map((addr: Record<string, unknown>) => {
          const raw: RawAddressModel = {
            ...addr,
            houseNumber,
            firstName: "",
            lastName: "",
            lon: String((addr as { long?: number }).long ?? ""),
          } as RawAddressModel;
          return transformAddress(raw);
        });
        setAddresses(transformed);
      } else {
        setError(data.errormessage || "No results found!");
      }
    } catch {
      setError("Failed to fetch addresses");
    } finally {
      setAddressLoading(false);
    }
  };

  const handlePersonSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);

    const { selectedAddress, firstName, lastName } = form.values;

    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name fields mandatory!");
      return;
    }
    if (!selectedAddress || !addresses.length) {
      setError(
        "No address selected, try to select an address or find one if you haven't"
      );
      return;
    }

    const foundAddress = addresses.find(
      (address) => address.id === selectedAddress
    );

    if (!foundAddress) {
      setError("Selected address not found");
      return;
    }

    addAddress({ ...foundAddress, firstName, lastName });
  };

  const findAddressFormEntries = [
    {
      name: "postCode",
      placeholder: "Post Code",
      extraProps: { value: form.values.postCode, onChange: form.onChange },
    },
    {
      name: "houseNumber",
      placeholder: "House number",
      extraProps: { value: form.values.houseNumber, onChange: form.onChange },
    },
  ];

  const personalInfoFormEntries = [
    {
      name: "firstName",
      placeholder: "First name",
      extraProps: { value: form.values.firstName, onChange: form.onChange },
    },
    {
      name: "lastName",
      placeholder: "Last name",
      extraProps: { value: form.values.lastName, onChange: form.onChange },
    },
  ];

  return (
    <main>
      <Section>
        <h1>
          Create your own address book!
          <br />
          <small>
            Enter an address by postcode add personal info and done! 👏
          </small>
        </h1>

        <Form
          label="🏠 Find an address"
          loading={addressLoading}
          formEntries={findAddressFormEntries}
          onFormSubmit={handleAddressSubmit}
          submitText="Find"
        />

        {addresses.length > 0 &&
          addresses.map((address) => (
            <Radio
              key={address.id}
              name="selectedAddress"
              id={address.id}
              onChange={form.onChange}
            >
              <Address {...address} />
            </Radio>
          ))}

        {form.values.selectedAddress && (
          <Form
            label="✏️ Add personal info to address"
            loading={false}
            formEntries={personalInfoFormEntries}
            onFormSubmit={handlePersonSubmit}
            submitText="Add to addressbook"
          />
        )}

        {/* TODO: Create an <ErrorMessage /> component for displaying an error message */}
        {error && <div className="error">{error}</div>}

        {/* TODO: Add a button to clear all form fields. 
        Button must look different from the default primary button, see design. 
        Button text name must be "Clear all fields"
        On Click, it must clear all form fields, remove all search results and clear all prior
        error messages
        */}
      </Section>

      <Section variant="dark">
        <AddressBook />
      </Section>
    </main>
  );
}

export default App;
