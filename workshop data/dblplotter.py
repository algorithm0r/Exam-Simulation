import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Read the CSV files
file1_path = './randomExam.csv'
file2_path = './allGuessesRandomExam.csv'

data1 = pd.read_csv(file1_path)
data2 = pd.read_csv(file2_path)

# Remove the first 40 columns
data1 = data1.iloc[:, 40:]
data2 = data2.iloc[:, 40:]

# Extract the non-zero row from each file
non_zero_row1 = data1[(data1.T != 0).any()].iloc[0]
non_zero_row2 = data2[(data2.T != 0).any()].iloc[0]

# X-axis for bins
x = np.arange(non_zero_row1.size) + 40
width = 0.35  # Width of the bars

# Plot histograms
fig, ax = plt.subplots(figsize=(3.25, 2))

# Histogram for the first file
ax.bar(x - width/2, non_zero_row1, width, color='#1f77b4', label='Ambitions of 85%')

# Histogram for the second file
ax.bar(x + width/2, non_zero_row2, width, color='#ff7f0e', label='All Guesses')

ax.set_xlabel('Questions Correct')
ax.set_ylabel('Number of Students')

plt.tight_layout()  # Adjust layout to make room for the labels
plt.show()