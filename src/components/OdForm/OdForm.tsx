'use client';

import { useState } from 'react';
import { Fieldset, NativeSelect, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';

function OdForm() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <Fieldset legend="Application for OD">
      <TextInput label="Your name" placeholder="Your name" />
      <TextInput label="Register No." placeholder="Register No." mt="md" />
      <Textarea
        label="Reason"
        description="Why you want OD"
        placeholder="Participating in event..."
        mt="md"
      />
      <DateInput value={date} onChange={setDate} label="Date input" placeholder="Date input" mt="md" />

      <NativeSelect
        label="Select Your Department"
        description="Select Your Department"
        data={['BBA', 'BCA', 'B.Com']}
        mt="md"
      />
      <NativeSelect
        label="Select Your Tutor"
        description="Select Your Tutor"
        data={['A', 'B', 'C']}
        mt="md"
      />
    </Fieldset>
  );
}

export default OdForm;
