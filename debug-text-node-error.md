# Debugging "Unexpected text node" Error

## Common Causes and Solutions

### 1. Check for stray periods or text in JSX
Look for patterns like:
```jsx
// BAD - stray period
<View>
  {condition && .}
</View>

// BAD - text not in Text component
<View>
  Some text here
</View>

// GOOD
<View>
  <Text>Some text here</Text>
</View>
```

### 2. Check conditional rendering
```jsx
// BAD
<View>
  {condition && "Some text"}
</View>

// GOOD
<View>
  {condition && <Text>Some text</Text>}
</View>
```

### 3. Check template strings
```jsx
// BAD - if variable is undefined, might render "undefined"
<View>
  {`${someVariable}`}
</View>

// GOOD
<View>
  <Text>{`${someVariable || ''}`}</Text>
</View>
```

## How to Find the Error

1. **Check the Metro bundler output** - it usually shows the file and line number
2. **Comment out sections** of your app to isolate where the error occurs
3. **Look for recent changes** in files you've modified

## Quick Fix Commands

Run these commands to search for potential issues:

```bash
# Search for stray periods in JSX files
grep -r "\." --include="*.tsx" --include="*.ts" app/ components/

# Search for text that might not be wrapped
grep -r ">" --include="*.tsx" app/ components/ | grep -v "</\|<Text\|</"
```