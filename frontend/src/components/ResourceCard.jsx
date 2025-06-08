import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaYoutube, FaBook, FaStar, FaEye, FaThumbsUp, FaClock } from 'react-icons/fa';
import './SkillResources.css';

const ResourceCard = ({ resource }) => {
  const {
    title,
    description,
    thumbnail,
    source,
    url,
    duration,
    rating,
    instructor,
    formattedViews,
    formattedLikes,
    formattedDuration,
    qualityIndicator
  } = resource;

  const isYouTube = source === 'YouTube';

  return (
    <Card className="resource-card h-100 shadow-sm">
      <div className="resource-thumbnail">
        <img src={thumbnail} alt={title} className="w-100" />
        {isYouTube && formattedDuration && (
          <div className="duration-badge">
            <FaClock className="me-1" />
            {formattedDuration}
          </div>
        )}
      </div>
      
      <Card.Body>
        <div className="d-flex justify-content-between mb-2">
          <Badge bg={isYouTube ? 'danger' : 'primary'}>
            {isYouTube ? <FaYoutube className="me-1" /> : <FaBook className="me-1" />}
            {source}
          </Badge>
          {qualityIndicator && (
            <Badge bg="success">
              <FaStar className="me-1" />
              {qualityIndicator}
            </Badge>
          )}
        </div>
        
        <Card.Title className="text-truncate">{title}</Card.Title>
        
        <Card.Text className="description-text">
          {description}
        </Card.Text>
        
        {instructor && (
          <small className="text-muted d-block mb-2">
            By: {instructor}
          </small>
        )}
        
        {isYouTube && (
          <div className="d-flex gap-2 mb-2">
            {formattedViews && (
              <small className="text-muted">
                <FaEye className="me-1" />
                {formattedViews} views
              </small>
            )}
            {formattedLikes && (
              <small className="text-muted">
                <FaThumbsUp className="me-1" />
                {formattedLikes}
              </small>
            )}
          </div>
        )}
        
        {!isYouTube && duration && (
          <small className="text-muted d-block mb-2">
            <FaClock className="me-1" />
            {duration}
          </small>
        )}
      </Card.Body>
      
      <Card.Footer className="bg-white border-0">
        <Button 
          variant="outline-primary" 
          href={url} 
          target="_blank" 
          className="w-100"
        >
          Start Learning
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default ResourceCard; 