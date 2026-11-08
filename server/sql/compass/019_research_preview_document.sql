-- Research Preview Document

BEGIN;

INSERT INTO public.research_consent_documents (
    version_code,
    consent_kind,
    title,
    document_text,
    status
)
VALUES (
    'TEST-PREVIEW-v1',

    'preview',

    'MyList Compass Research Form Preview',

    $document$
MYLIST COMPASS
RESEARCH FORM PREVIEW
Version: TEST-PREVIEW-v1

1. Purpose

This document describes a demonstration of the
MyList Compass emotional annotation form.

The demonstration is intended for software testing.
It does not constitute participation in a research study.

2. Preview Functionality

Test users can explore the annotation interface,
select media titles, and enter emotional ratings.

The form allows evaluation of six emotional
categories using intensity and confidence scales.

3. Data Processing

Answers submitted through the preview-check endpoint
are transmitted to the server for validation.

This endpoint does not save responses as research
annotations.

A separate development-only test-save function
may store test data when explicitly enabled.
It is not part of the normal form preview.

4. Research Consent

Reviewing this document does not constitute
informed consent to participate in research.

Formal research participation is not enabled
through this preview.

5. Personal Information

Test users should not enter real personal information
in optional annotation comments.

6. Withdrawal

Test users may stop using the preview at any time.

Research participation statuses are managed
separately by the application.

7. Document Status

This document is a draft for software testing.

It is not an approved research consent document.
$document$,

    'draft'
)

ON CONFLICT (consent_kind, version_code)
DO NOTHING;

COMMIT;