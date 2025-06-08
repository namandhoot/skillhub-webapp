import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import ResourceCard from './ResourceCard';
import axios from 'axios';
import './SkillResources.css';

const ResourceGrid = ({ skillName, type = 'skill' }) => {
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResources();
  }, [skillName, type]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = type === 'role' 
        ? `/api/learning/role/${skillName}`
        : `/api/learning/skill/${skillName}`;

      const response = await axios.get(endpoint);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch resources');
      }
      
      setResources(response.data.data);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading resources...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        {error}
      </Alert>
    );
  }

  if (!resources || Object.values(resources.resources).every(arr => arr.length === 0)) {
    return (
      <Alert variant="info" className="m-3">
        No resources found for {skillName}
      </Alert>
    );
  }

  const { recommended, courses, videos } = resources.resources;

  return (
    <Container fluid className="py-4">
      {/* Recommended Resources */}
      {recommended && recommended.length > 0 && (
        <>
          <h3 className="mb-4">Recommended Resources</h3>
          <Row xs={1} md={2} lg={3} className="g-4 mb-5">
            {recommended.map((resource, idx) => (
              <Col key={idx}>
                <ResourceCard resource={resource} />
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Online Courses */}
      {courses && courses.length > 0 && (
        <>
          <h3 className="mb-4">Online Courses</h3>
          <Row xs={1} md={2} lg={4} className="g-4 mb-5">
            {courses.map((resource, idx) => (
              <Col key={idx}>
                <ResourceCard resource={resource} />
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Video Tutorials */}
      {videos && videos.length > 0 && (
        <>
          <h3 className="mb-4">Video Tutorials</h3>
          <Row xs={1} md={2} lg={4} className="g-4">
            {videos.map((resource, idx) => (
              <Col key={idx}>
                <ResourceCard resource={resource} />
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Stats */}
      {resources.stats && (
        <div className="text-muted text-center mt-4">
          <small>
            Found {resources.totalFound} resources 
            ({resources.stats.youtubeCount} videos, {resources.stats.courseraCount} courses)
          </small>
        </div>
      )}
    </Container>
  );
};

export default ResourceGrid; 