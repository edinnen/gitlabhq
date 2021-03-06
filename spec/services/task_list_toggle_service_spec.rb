# frozen_string_literal: true

require 'spec_helper'

describe TaskListToggleService do
  let(:markdown) do
    <<-EOT.strip_heredoc
      * [ ] Task 1
      * [x] Task 2

      A paragraph

      1. [X] Item 1
         - [ ] Sub-item 1
    EOT
  end

  let(:markdown_html) do
    <<-EOT.strip_heredoc
      <ul data-sourcepos="1:1-3:0" class="task-list" dir="auto">
        <li data-sourcepos="1:1-1:12" class="task-list-item">
          <input type="checkbox" class="task-list-item-checkbox" disabled> Task 1
        </li>
        <li data-sourcepos="2:1-3:0" class="task-list-item">
          <input type="checkbox" class="task-list-item-checkbox" disabled checked> Task 2
        </li>
      </ul>
      <p data-sourcepos="4:1-4:11" dir="auto">A paragraph</p>
      <ol data-sourcepos="6:1-7:19" class="task-list" dir="auto">
        <li data-sourcepos="6:1-7:19" class="task-list-item">
          <input type="checkbox" class="task-list-item-checkbox" disabled checked> Item 1
          <ul data-sourcepos="7:4-7:19" class="task-list">
            <li data-sourcepos="7:4-7:19" class="task-list-item">
              <input type="checkbox" class="task-list-item-checkbox" disabled> Sub-item 1
            </li>
          </ul>
        </li>
      </ol>
    EOT
  end

  it 'checks Task 1' do
    toggler = described_class.new(markdown, markdown_html,
                                  toggle_as_checked: true,
                                  line_source: '* [ ] Task 1', line_number: 1)

    expect(toggler.execute).to be_truthy
    expect(toggler.updated_markdown.lines[0]).to eq "* [x] Task 1\n"
    expect(toggler.updated_markdown_html).to include('disabled checked> Task 1')
  end

  it 'unchecks Item 1' do
    toggler = described_class.new(markdown, markdown_html,
                                  toggle_as_checked: false,
                                  line_source: '1. [X] Item 1', line_number: 6)

    expect(toggler.execute).to be_truthy
    expect(toggler.updated_markdown.lines[5]).to eq "1. [ ] Item 1\n"
    expect(toggler.updated_markdown_html).to include('disabled> Item 1')
  end

  it 'returns false if line_source does not match the text' do
    toggler = described_class.new(markdown, markdown_html,
                                  toggle_as_checked: false,
                                  line_source: '* [x] Task Added', line_number: 2)

    expect(toggler.execute).to be_falsey
  end

  it 'tolerates \r\n line endings' do
    rn_markdown = markdown.gsub("\n", "\r\n")
    toggler = described_class.new(rn_markdown, markdown_html,
                                  toggle_as_checked: true,
                                  line_source: '* [ ] Task 1', line_number: 1)

    expect(toggler.execute).to be_truthy
    expect(toggler.updated_markdown.lines[0]).to eq "* [x] Task 1\r\n"
    expect(toggler.updated_markdown_html).to include('disabled checked> Task 1')
  end

  it 'returns false if markdown is nil' do
    toggler = described_class.new(nil, markdown_html,
                                  toggle_as_checked: false,
                                  line_source: '* [x] Task Added', line_number: 2)

    expect(toggler.execute).to be_falsey
  end

  it 'returns false if markdown_html is nil' do
    toggler = described_class.new(markdown, nil,
                                  toggle_as_checked: false,
                                  line_source: '* [x] Task Added', line_number: 2)

    expect(toggler.execute).to be_falsey
  end
end
