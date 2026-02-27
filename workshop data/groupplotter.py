import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Filenames and labels
file_labels = [
    ('focus', 'Focus'),
    ('anxiety', 'Anxiety'),
    ('endurance', 'Endurance'),
    ('ambition', 'Ambition'),
    ('guesses', 'Guesses'),
    ('examOrder', 'Exam Order')
]

# Function to read data and remove first 40 columns
def read_and_process(file_path):
    data = pd.read_csv(file_path)
    data = data.iloc[:, 40:]  # Remove the first 40 columns
    non_zero_rows = data[(data.T != 0).any()]
    return non_zero_rows

# Create subplots
fig, axes = plt.subplots(2, 3, figsize=(6.5, 4))
axes = axes.flatten()

# Plot each pair of histograms
for i, (file_label, title) in enumerate(file_labels):
    file_path = f'./{file_label}.csv'
    non_zero_rows = read_and_process(file_path)
    non_zero_row1 = non_zero_rows.iloc[0]
    non_zero_row2 = non_zero_rows.iloc[1]

    x = np.arange(non_zero_row1.size) + 40  # Shift x-axis labels to start at 40
    width = 0.35  # Width of the bars

    ax = axes[i]
    
    # Histogram for the first set of data
    ax.bar(x - width/2, non_zero_row1, width, color='#1f77b4')

    # Histogram for the second set of data
    ax.bar(x + width/2, non_zero_row2, width, color='#ff7f0e')

    if i in [0, 3]: 
        ax.set_ylabel('Number of Students')
        desired_ticks = np.arange(0, 600, 100)
        ax.set_yticks(desired_ticks)
        ax.set_yticklabels(desired_ticks)
    else:
        ax.tick_params(axis='y', which='both', left=False, labelleft=False)

    if i in [3, 4, 5]:
        desired_ticks = np.arange(40, 101, 10)
        ax.set_xticks(desired_ticks)
        ax.set_xticklabels(desired_ticks)
    else:
        ax.tick_params(axis='x', which='both', bottom=False, labelbottom=False)

    ax.set_title(f'{title}')

# Add a single x-axis label for the entire figure
fig.text(0.5, 0.03, 'Questions Correct', ha='center')


plt.tight_layout(rect=[0, 0.03, 1, 0.94])  # Adjust layout to make room for the x-axis label
plt.show()
