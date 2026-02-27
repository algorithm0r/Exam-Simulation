import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Read the CSV file
file_path = './focusRuns.csv'
data = pd.read_csv(file_path, header=None)

# Extract the first two rows
row1 = data.iloc[0]
row2 = data.iloc[1]

# X-axis for bins
x = np.arange(row1.size)
width = 0.35  # Width of the bars

# Plot histograms
fig, ax = plt.subplots(figsize=(3.25, 2))

# Histogram for the first row
ax.bar(x - width/2, row1, width, color='#1f77b4', label='Row 1')

# Histogram for the second row
ax.bar(x + width/2, row2, width, color='#ff7f0e', label='Row 2')

ax.set_xlabel('Questions Correct')
ax.set_ylabel('Number of Students')
ax.legend()

plt.tight_layout()  # Adjust layout to make room for the labels
plt.show()