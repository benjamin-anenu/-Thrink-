
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Search, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';

export interface Skill {
  id: string;
  name: string;
}

export interface SelectedSkill {
  skill_id: string;
  skill_name: string;
  proficiency: number;
  years_experience: number;
}

interface SkillSelectProps {
  selectedSkills: SelectedSkill[];
  onSkillsChange: (skills: SelectedSkill[]) => void;
  placeholder?: string;
}

export function SkillSelect({ selectedSkills, onSkillsChange, placeholder = "Search or add skills..." }: SkillSelectProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock skills data until database tables are created
  useEffect(() => {
    async function fetchSkills() {
      setLoading(true);
      const mockSkills: Skill[] = [
        { id: '1', name: 'React' },
        { id: '2', name: 'TypeScript' },
        { id: '3', name: 'Node.js' },
        { id: '4', name: 'Python' },
        { id: '5', name: 'UI/UX Design' },
        { id: '6', name: 'Project Management' },
        { id: '7', name: 'Agile' },
        { id: '8', name: 'DevOps' },
        { id: '9', name: 'Figma' },
        { id: '10', name: 'SEO' }
      ];
      setSkills(mockSkills);
      setLoading(false);
    }
    fetchSkills();
  }, []);

  // Filter skills based on search term
  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedSkills.some(selected => selected.skill_id === skill.id)
  );

  // Check if search term matches any existing skill
  const exactMatch = skills.find(skill => 
    skill.name.toLowerCase() === searchTerm.toLowerCase()
  );

  // Add new skill to database
  const handleAddNewSkill = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    // For now, create a mock skill
    const newSkill: Skill = {
      id: `custom-${Date.now()}`,
      name: searchTerm.trim()
    };
    
    setSkills([...skills, newSkill]);
    onSkillsChange([...selectedSkills, {
      skill_id: newSkill.id,
      skill_name: newSkill.name,
      proficiency: 3,
      years_experience: 0
    }]);
    setSearchTerm('');
    setIsAddingNew(false);
    setShowDropdown(false);
    setLoading(false);
  };

  // Select existing skill
  const handleSkillSelect = (skill: Skill) => {
    onSkillsChange([...selectedSkills, {
      skill_id: skill.id,
      skill_name: skill.name,
      proficiency: 3,
      years_experience: 0
    }]);
    setSearchTerm('');
    setShowDropdown(false);
    setIsAddingNew(false);
  };

  // Remove skill
  const handleRemoveSkill = (skillId: string) => {
    onSkillsChange(selectedSkills.filter(s => s.skill_id !== skillId));
  };

  // Update skill proficiency or years
  const handleSkillChange = (skillId: string, field: 'proficiency' | 'years_experience', value: number) => {
    onSkillsChange(selectedSkills.map(s =>
      s.skill_id === skillId ? { ...s, [field]: value } : s
    ));
  };

  // Handle input changes
  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setShowDropdown(true);
    setIsAddingNew(false);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (exactMatch) {
        handleSkillSelect(exactMatch);
      } else if (searchTerm.trim() && !exactMatch) {
        handleAddNewSkill();
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Single Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button 
              type="button" 
              onClick={() => {
                if (exactMatch) {
                  handleSkillSelect(exactMatch);
                } else {
                  handleAddNewSkill();
                }
              }}
              size="sm"
              disabled={!searchTerm.trim() || loading}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            >
              <Plus size={14} />
            </Button>
          )}
        </div>
        
        {/* Dropdown */}
        {showDropdown && searchTerm && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-sm text-gray-500">Loading...</div>
            ) : (
              <>
                {/* Existing skills */}
                {filteredSkills.map(skill => (
                  <button
                    key={skill.id}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center justify-between"
                    onClick={() => handleSkillSelect(skill)}
                  >
                    <span>{skill.name}</span>
                    <Check size={14} className="text-green-500" />
                  </button>
                ))}
                
                {/* Add new skill option */}
                {searchTerm.trim() && !exactMatch && filteredSkills.length === 0 && (
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center justify-between border-t border-gray-100"
                    onClick={handleAddNewSkill}
                  >
                    <span className="text-blue-600">Add "{searchTerm}" as new skill</span>
                    <Plus size={14} className="text-blue-500" />
                  </button>
                )}
                
                {/* No results */}
                {!filteredSkills.length && !searchTerm.trim() && (
                  <div className="p-3 text-sm text-gray-500">Start typing to search skills...</div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Skills</Label>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map(skill => (
              <Badge key={skill.skill_id} variant="secondary" className="flex items-center gap-2 p-2">
                <span className="font-medium">{skill.skill_name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Proficiency:</span>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={skill.proficiency}
                    onChange={e => handleSkillChange(skill.skill_id, 'proficiency', Number(e.target.value))}
                    className="w-12 h-6 text-xs px-1"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Years:</span>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={skill.years_experience}
                    onChange={e => handleSkillChange(skill.skill_id, 'years_experience', Number(e.target.value))}
                    className="w-12 h-6 text-xs px-1"
                  />
                </div>
                <X 
                  size={12} 
                  className="cursor-pointer hover:text-destructive" 
                  onClick={() => handleRemoveSkill(skill.skill_id)} 
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
