## ADDED Requirements

### Requirement: Responsive filter composition

The library SHALL provide a labelled FilterBar region with application-provided filter and action snippets that wrap without page-wide horizontal overflow at 320px.

#### Scenario: Narrow filters

- **GIVEN** search, select, date controls and two action buttons inside a FilterBar
- **WHEN** its container is 320px wide
- **THEN** controls and actions SHALL remain usable in source order without page-wide horizontal scrolling

### Requirement: Signed allocation presentation

The library SHALL provide AllocationBreakdown with explicit signed percentages, preformatted values, category labels and diverging bars around a zero baseline.

#### Scenario: Assets and liabilities against net wealth

- **GIVEN** rows with percentages 120 and -20
- **WHEN** the breakdown renders
- **THEN** both percentages SHALL remain unchanged as text and bars SHALL distinguish positive and negative direction

#### Scenario: Zero or invalid percentages

- **GIVEN** zero, NaN or infinite percentages
- **WHEN** the breakdown renders
- **THEN** it SHALL produce no invalid CSS geometry and SHALL distinguish unavailable input from a zero value

### Requirement: Opt-in KPI hierarchy

KpiCard SHALL support optional featured emphasis and value tone while preserving existing default behavior and preformatted/snippet values.

#### Scenario: Backward-compatible card

- **GIVEN** a KpiCard without the new options
- **WHEN** it renders
- **THEN** its existing appearance and accessible naming SHALL remain unchanged

### Requirement: Header actions on narrow screens

PageHeader SHALL wrap heading and actions within the available container width.

#### Scenario: Portuguese heading and two actions

- **GIVEN** a PageHeader with a long Portuguese title and two action buttons
- **WHEN** its container is 320px wide
- **THEN** the heading and actions SHALL not overlap or cause page-wide horizontal overflow

### Requirement: Finance adoption example

The library SHALL document a synthetic finance composition using existing shared layout, data, navigation and empty-state primitives alongside the new patterns.

#### Scenario: Example data

- **WHEN** the finance showcase renders
- **THEN** it SHALL use synthetic records and explain that the consuming application supplies financial data and semantics

#### Scenario: Cash flow and negative balance demonstration

- **GIVEN** synthetic transaction amounts and preformatted balance states
- **WHEN** a user simulates successive outflows
- **THEN** income SHALL appear blue, outflows red, zero balance SHALL show a warning and negative balance SHALL show an accessible alert without persisting financial operations

#### Scenario: Consistent simulated records and configurable early warning

- **WHEN** the user simulates an outflow or resets the demonstration
- **THEN** the table SHALL add or remove the corresponding synthetic rows consistently with summary totals
- **AND** a labelled local threshold selector SHALL show an early warning for a positive balance strictly below the selected limit, with zero and negative messages taking precedence
